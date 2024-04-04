require('babel-register')({presets: [ 'env' ],compact:false});
const express = require('express');
const compression = require('compression');
const next = require('next');
const path = require('path');
const sslRedirect = require('heroku-ssl-redirect');
const nextI18NextMiddleware = require('next-i18next/middleware');
const nextI18next = require('./i18n');
const routes = require('./routes');
const favicon = require('serve-favicon');
const PORT = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = routes.getRequestHandler(app);
const cacheLifeTime = process.env.CACHE_LIFE_TIME || '365d';
const enableIndex = process.env.ENABLE_INDEX;

(async () => {
    await app.prepare();
    const server = express();
    server.use(sslRedirect(['production']));

    server.use(compression());
    server.use(favicon(path.join(__dirname, 'static', 'images', 'icons', 'favicon_project.png')));
    server.use('/_next/static/:hash/pages', (req, res, next) => {
        const page = routes.getPageByUrl(req.originalUrl);
        if (page && !dev) {
            return res.status(200).sendFile(__dirname + page.replace('_next','next_build'), {
                headers: {
                    'Content-Type': 'text/plain;charset=UTF-8',
                }
            });
        }
        next();
    });
    server.use(nextI18NextMiddleware(nextI18next));
    server.use('/static', express.static(__dirname + '/static', {
        maxAge: cacheLifeTime
    }));

    server.get([
        '/pdf.worker.js'
    ], (req, res) => (
        res.status(200).sendFile('pdf.worker.min.js', {
            root: __dirname + '/static/libs'
        })
    ));

    server.get('/service-worker.js', (req, res) => {
        res.status(200).sendFile('service-worker.js', {
            root: __dirname + '/next_build/',
            headers: {
                'Content-Type': 'application/javascript; charset=utf-8',
            }
        });
    });

    server.get('*', (req, res) => {
        return handle(req, res);
    });

    await server.listen(PORT);
    console.log(`> Ready on http://localhost:${PORT}`);
})();
