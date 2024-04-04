import styled from 'styled-components';

export default styled.div`
    position: relative;
    .bg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: calc(100vh - 90px);
        background-image: url('/static/images/background-setPassword.png');
        background-size: cover;
        filter: blur(10px);
    }
    .base {
        z-index: 2;
        display: flex;
        justify-content: center;
        width: 100%;
        margin-top: 90px;

        h2 {
            font-family: 'Space Grotesk Semi Bold';
            font-size: 32px;
            font-weight: 600;
            line-height: 40px;
            letter-spacing: normal;
            color: #42526e;
        }

        h3 {
            color: #505f79;
            font-family: "Space Grotesk";
            font-size: 15px;
            font-weight: 400;
            letter-spacing: 0.2px;
            line-height: 24px;
            margin-bottom: 42px;
        }

        .input-box {
            box-shadow: 0 8px 16px rgba(10, 31, 68, 0.04), 0 0 1px rgba(10, 31, 68, 0.08);
            padding-left: 16.5px;
            box-sizing: border-box;
            height: 56px;
            transition: 0.3s;
            border: 1px solid #dfe1e6;
            border-radius: 4px;
            background-color: #ffffff;
            margin-bottom: 12px;
            overflow: hidden;
            input {
                background: transparent;
                border: none;
                border-bottom: 1px solid #d0d0d0;
                height: 43px;
            }
            &:hover {
                border-color: #b3bac5;
                box-shadow: 0 12px 32px 0 rgba(10, 31, 68, 0.08),
                    0 0 1px 0 rgba(10, 31, 68, 0.1);
                span {
                    color: #505f79 !important;
                }
            }
            &:focus-within {
                border-color: #b3bac5;
                box-shadow: none;
            }
            &.input-box-error {
                border-color: #ff8f73;
                box-shadow: none;
                margin-bottom: 15px;
            }
            .validation {
                position: absolute;
                color: #ff5630;
                font-family: 'Space Grotesk';
                font-size: 10px;
                line-height: 16px;
                left: 45px;
            }
        }
    }
    
    .btn {
        padding: 0;
    }

    .button {
        height: 40px;
        width: 100%;
        border-radius: 4px;
        background-color: #0065ff;
        font-family: "Space Grotesk Semi Bold";
        font-weight: 600;
        box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0);
        color: #fafbfc;
        font-size: 13px;
        border: 0;
        &:hover {
            background-color: #2684ff;
        }
        &:active {
            background-color: #0052cc;
        }
        &:disabled {
            background-color: #f4f5f7;
            color: #c1c7d0;
            cursor: not-allowed;
            box-shadow: none;
        }
    }

    form {
        position: relative;
        margin-top: 105px;
        width: 100%;
        max-width: 335px;
        padding: 32px 40px 40px 40px;
        border-radius: 13px;
        background-color: #ffffff;
        box-shadow: 0 24px 48px 0 rgba(0, 0, 0, 0.06);
        input {
            padding: 0px;
            margin-top: 0;
            margin-bottom: 0;
        }
    }
    @media only screen and (max-width: 500px) {
        .base form {
            max-width: 288px;
            padding: 37px 16px 40px 16px;
        }
        .base h2 {
            font-size: 20px;
            line-height: 24px;
            text-align: center;
            margin-bottom: 14px;
        }        
        .base h3 {
            font-size: 12px;
            line-height: 16px;
            text-align: center;
            margin-bottom: 54px;
        }
    }
`;
