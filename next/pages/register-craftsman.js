import React, { Component } from 'react';
import PropTypes from 'prop-types';
import checkAuth from 'hoc/checkAuth';
import DefaultLayout from 'components/layouts/DefaultLayout';
import SeoHeader from 'components/general/SeoHeader';
import RegisterWorkerForm from 'components/forms/RegisterWorkerForm';
import { HideHubspotChat } from 'style/GlobalStyles';

class RegisterWorker extends Component {
    static async getInitialProps() {
        const namespacesRequired = ['pageTitles', 'forms', 'defaultLayout', 'validation', 'workerplace'];
        return {
            namespacesRequired,
        };
    }

    static propTypes = {
        router: PropTypes.object,
    };

    render() {
        const { router } = this.props;
        return (
            <DefaultLayout {...this.props}>
                <SeoHeader titleKey={'registerWorker'} prefix={'marketplace'} />
                <HideHubspotChat />
                <RegisterWorkerForm router={router} />
            </DefaultLayout>
        );
    }
}

export default checkAuth(RegisterWorker);
