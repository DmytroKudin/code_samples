import App from 'next/app';
import React from 'react';
import withReduxStore from 'hoc/with-redux-store';
import {Provider} from 'react-redux';
import { appWithTranslation } from 'i18n';

class MyApp extends App {
    render () {
        const {Component, pageProps, reduxStore} = this.props;
        return (
            <Provider store={reduxStore}>
                    <Component {...pageProps}
                               currentUrl={this.props.currentUrl}
                               router={this.props.router}
                               isAdminDashboard={this.isAdminDashboard()}
                               hideCookieConsent={() => this.hideCookieConsent()} />
            </Provider>
        );
    }
}

export default withReduxStore(appWithTranslation(MyApp));
