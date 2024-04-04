import React from 'react';
import { axiosController } from 'utils/axiosController';
import { parseCookies } from 'nookies';
import { fetchAuthUser } from 'store/auth/actions';
import { Router } from 'routes';
import { i18n } from 'i18n';
import { authRequired, notForAuth } from 'utils/authHelper';

export default Child => {
    return class Higher extends React.Component {
        static async getInitialProps(ctx) {
            const { reduxStore, res, asPath } = ctx;
            const { projectToken } = parseCookies(ctx);
            let store = reduxStore.getState();
            if(!store.auth.isAuthenticated && projectToken && !process.browser){
                axiosController.setAuthHeader(projectToken);
                try {
                    await reduxStore.dispatch(fetchAuthUser());
                    store = reduxStore.getState();
                } catch (e) {
                    axiosController.deleteToken();
                }
            }
            const loginPage = i18n.t('links:login');
            if(!store.auth.isAuthenticated && authRequired(asPath) && !notForAuth(asPath)){
                if (res) {
                    res.writeHead(302, { Location: loginPage });
                    res.end();
                } else {
                    Router.pushRoute(loginPage);
                }
            } else if(store.auth.isAuthenticated && notForAuth(asPath)){
                if (res) {
                    res.writeHead(302, { Location: '/' });
                    res.end();
                } else {
                    Router.pushRoute('/');
                }
            }
            return Child.getInitialProps(ctx);
        }
        render() {
            { axiosController.setAuthHeader(); }
            return <Child {...this.props} />;
        }
    };
};
