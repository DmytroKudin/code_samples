import React from 'react';
import DefaultLayout from 'components/layouts/DefaultLayout';
import SeoHeader from 'components/general/SeoHeader';
import InviteCodeForm from 'components/forms/InviteCodeForm';
import checkAuth from 'hoc/checkAuth';
import PropTypes from 'prop-types';

class InviteCode extends React.Component {
    static async getInitialProps({query}) {
        const namespacesRequired = [
            'inviteCodeSteps',
            'pageTitles',
            'workerHomepage',
            'defaultLayout',
            'validation',
            'links',
            'quote',
        ];
        return {
            namespacesRequired,
            code:query.code
        };
    }

    static propTypes = {
        code: PropTypes.string
    };

    render () {
        return(
            <DefaultLayout {...this.props} >
                <SeoHeader titleKey={'workerplace.root'} />
                <InviteCodeForm code={this.props.code}/>
            </DefaultLayout>
        );
    }
}

export default checkAuth(InviteCode);
