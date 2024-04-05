import Imap from 'node-imap';
import nodemailer from 'nodemailer';
import {simpleParser} from 'mailparser';
import {getWorkerEmail} from "../../api/api.js";
import {loadConfig} from "../../helpers/envConfig.js";

loadConfig()

export const imapService = {
    createTransport: function () {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD
            }
        });
    },
    sendMail: async function (subject, text, email, headers) {
        const transporter = this.createTransport()

        let mailOptions = {
            from: process.env.MAIL_USERNAME,
            to: email,
            subject,
            text
        };

        if (headers) mailOptions.headers = headers

        await new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log('Error sending email:', error);
                    reject(error)
                } else {
                    console.log('Email sent:', info.response);
                    resolve(info.response)
                }
            });
        })
    },
    imapAuth: function () {
        return new Imap({
            user: process.env.MAIL_USERNAME,
            password: process.env.MAIL_PASSWORD,
            host: 'imap.gmail.com',
            port: 993,
            tls: true,
        })
    },
    watcher: async function () {
        const imap = this.imapAuth();

        imap.once('ready', function () {
            imap.openBox('INBOX', false, function (err, box) {
                if (err) throw err;
                    imap.search(['UNSEEN'], function (err, results) {
                        if (err) {
                            console.error("Error during search:", err);
                            return;
                        }

                        if (results && results.length) {
                            let f = imap.fetch(results, {bodies: ''});
                            f.on('message', function (msg, seqno) {
                                msg.on('body', function (stream, info) {
                                    simpleParser(stream, function (err, mail) {
                                        if (err) {
                                            console.error("Error parsing mail:", err);
                                            return;
                                        }
                                        mail.attributes = msg.attributes;
                                        if (mail.from.value[0].address.includes('@reply.data.org')) {
                                            checkIncome(mail, seqno);
                                        } else if (mail.from.value[0].address === 'robot@data.org') {
                                            checkCreateAd(mail, seqno)
                                        } else {
                                            checkReplays(mail, seqno);
                                        }
                                    });
                                });
                            });
                        }
                    });
                // });
            });
        });

        imap.once('error', function (err) {
            imap.end()
            console.error('IMAP Error:', err);
        });

        imap.once('end', function () {
            console.log('IMAP Connection ended');
        });

        imap.connect();

        // The function checks incoming emails and searches them for a link to an ad.
        // If the link was found then the email is forwarded to the worker.
        async function checkIncome(mail, seqno) {
            try {
                let startIndex
                //It's a way of determining that a letter from a customer to a worker
                if (mail?.html) startIndex = mail.html.indexOf("Original data post:");
                if (mail?.text) startIndex = mail.text.indexOf("Original data post:");

                if (startIndex !== -1) {
                    let substring

                    if (mail?.html) substring = mail.html.substring(startIndex);
                    if (mail?.text) substring = mail.text.substring(startIndex);

                    const regex = /\/(\d+)\.html/;
                    //get postingId from the link
                    const match = regex.exec(substring);
                    if (match) {
                        const postingId = match[1];
                        console.log('postingId', postingId)
                        //get messageId for reply to customer
                        const messageId = mail.headers.get('message-id');
                        const email = await getWorkerEmail(postingId);
                        console.log('email', email)
                        if (!email) throw new Error('Worker email not found')
                        //forwarding email from customer to worker
                        await imapService.sendMail(
                            `Vehicle GoGo data: ${messageId}`,
                            mail.text,
                            email
                        );
                        console.log("Mail sent successfully");
                        imap.seq.addFlags(seqno, 'Seen', function (err) {
                            if (err) {
                                console.log('Error marking message as read:', err);
                            } else {
                                console.log('Message marked as read');
                            }
                        });
                    }
                }
                imap.end()
            } catch (error) {
                imap.end()
                console.error("Error in checkIncome:", error);
            }
        }
        //forward email the worker about the successful posting of the ad
        async function checkCreateAd(mail, seqno) {
            try {
                const regex = /posting ID: (\d+)/;
                const match = mail.text.match(regex);
                if (match && match[1]) {
                    const postingId = match[1];
                    const email = await getWorkerEmail(postingId);
                    if (!email) throw new Error(`Worker email not found; postingId: ${postingId}`)
                    await imapService.sendMail(
                        mail.subject,
                        mail.text,
                        email
                    );
                    imap.seq.addFlags(seqno, 'Seen', function (err) {
                        if (err) {
                            console.log('Error marking message as read:', err);
                        } else {
                            console.log('Message marked as read');
                        }
                    });
                }
                imap.end()
            } catch (error) {
                imap.end()
                console.error("Error in checkIncome:", error);
            }
        }
//Function for forwarding an email from the worker to the customer
        function checkReplays(mail, seqnoMsg) {
            try {
                if (!mail.from.value[0].address.includes('data')) {
                    const regex = /Vehicle GoGo data: <(.+)>/;
                    //getting messageId from subject to reply for customer
                    const match = regex.exec(mail.subject);
                    if (match) {
                        const messageId = match[1];
                        //looking for customer email by message
                        imap.search([['HEADER', 'MESSAGE-ID', messageId]], function (err, results) {
                            if (err) {
                                console.error("Error during search by messageId:", err);
                                return;
                            }

                            if (results && results.length) {
                                const targetFetch = imap.fetch(results, {bodies: ''});
                                targetFetch.on('message', function (targetMsg, seqno) {
                                    targetMsg.on('body', function (targetStream, info) {
                                        simpleParser(targetStream, function (err, parsedMail) {
                                            if (err) {
                                                console.error("Error parsing target mail:", err);
                                                return;
                                            }

                                            const headers = {
                                                ...parsedMail.headers,
                                                'In-Reply-To': messageId,
                                                'References': messageId
                                            };

                                            function removeThreadsFromMailText(mailText) {
                                                const lines = mailText.split('\n');
                                                const cleanLines = lines.filter(line => !line.trim().startsWith('>'));
                                                return cleanLines.join('\n').trim();
                                            }

                                            const text = removeThreadsFromMailText(mail.text)

                                            //reply email from worker to customer
                                            imapService.sendMail(
                                                `Re: ${parsedMail.subject}`,
                                                text,
                                                parsedMail.from.value[0].address,
                                                headers
                                            );

                                            imap.seq.addFlags(seqnoMsg, 'Seen', function (err) {
                                                if (err) {
                                                    console.error('Error marking a message as read:', err);
                                                } else {
                                                    console.log('This message has been marked as read');
                                                }
                                            });
                                        });
                                    });
                                });
                            }
                        });
                    }
                }
                imap.end()
            } catch (error) {
                imap.end()
                console.error("Error in checkReplays:", error);
            }
        }

    }
}
