import styled, { createGlobalStyle } from 'styled-components';

export const BackgroundBody = createGlobalStyle`
body {
    background: linear-gradient( to right, white 0%, white 43%, #F5FDFD 43%, #F5FDFD 100%);
    @media only screen and (max-width: 900px) {
        background: white;
    }
}
`;

export const Styles = styled.div`
.base {
    display: flex;
    justify-content: space-between;
    width: 100%;
    .input-box {
        margin-bottom: var(--indent-middle);
    }
    .divider-container {
        display: flex;
        align-items: center;
        margin-bottom: var(--indent-regular);
        span {
            font-family: var(--text-font-base);
            font-size: var(--divider-text-size);
            color: var(--muted-dark-color);
            margin: 0 var(--indent-small);
        }
    }
}  
.divider {
    width: 100%;
} 
.login-title {
    color: var(--secondary-color);
}
.login-subtitle {
    font-size: var(--subtitle-font-size); 
}
.btn-group {
    display: flex;
    flex-direction: column;
    align-items: center;
}
.workerplace-button {
    width: 80%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: var(--indent-small);
}
.loginFieldsWrapper {
    margin-top: var(--indent-larger);
}
.footer-login {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-top: var(--indent-middle);
    margin-bottom: var(--indent-regular);
}
.footer-link {
    color: var(--muted-dark-color);
    font-family: var(--text-font-base);
    font-size: var(--utility-text);
    &:hover {
        text-decoration:underline;
    }
}
.left-side {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    
    width: 45%;
    min-height: 100vh;
    padding: 16.5vw 6.5vw 6vw 11vw;
}
.login-main-image {
    display: flex;
    align-items: center;
    max-width: 55%;
    margin: 0 auto;
    padding-right: 8%;
    img {
        max-width: 100%;
    }
}
.workerplace, form {
    max-width: 350px;
    min-width: 250px;
}

@media only screen and (max-width: 1200px) {
    .left-side{
        padding-left:5vw;
        padding-right:5vw;
    }
}
@media only screen and (max-width: 900px) {
    .login-main-image {
        display: none;
    }  
    .workerplace,form {
        margin: 0 auto;
    }
    .loginFieldsWrapper{
        margin: 45px auto 0;
    }
    .left-side {
        margin: 0 auto;
        width: 100%;
        justify-content: space-evenly;
        min-height: calc(100vh - 60px);
        h1, p {
            text-align: center;
        }
    }
    .workerplace {
        padding: 0;
    }
}
@media only screen and (max-width: 540px) {
    .login-title {
        font-size: 20px;
        line-height: 1.2;
    }
    .login-subtitle{
        font-size: 12px;
    }
}
`;
