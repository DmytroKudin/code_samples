import React, { Component } from 'react';
import LoginForm from 'components/forms/LoginForm';
import DefaultLayout from 'components/layouts/DefaultLayout';
import SeoHeader from 'components/general/SeoHeader';
import checkAuth from 'hoc/checkAuth';

class Login extends Component {
    static async getInitialProps() {
        const namespacesRequired = ['forms', 'defaultLayout', 'pageTitles', 'validation', 'links'];
        return {
            namespacesRequired,
        };
    }
    render() {
        return (
            <DefaultLayout {...this.props}>
                <SeoHeader titleKey={'login'} />
                <LoginForm />
            </DefaultLayout>
        );
    }
}

export default checkAuth(Login);
