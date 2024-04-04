import React  from 'react';
import SeoHeader from 'components/general/SeoHeader/SeoHeader';
import DefaultLayout from 'components/layouts/DefaultLayout';
import RegisterWorkerplace from 'components/forms/WorkerplaceRegister/RegisterWorkerplace';
import checkAuth from 'hoc/checkAuth';

class Register extends React.Component {
    static async getInitialProps() {
        const namespacesRequired = ['pageTitles', 'defaultLayout', 'workerplace', 'forms', 'links', 'validation', 'quote'];
        return {
            namespacesRequired
        };
    }

    render() {
        return (
            <DefaultLayout {...this.props}>
                <SeoHeader titleKey={'workerplace.register'} />
                <RegisterWorkerplace />
            </DefaultLayout>
        );
    }
}

export default  checkAuth(Register);
