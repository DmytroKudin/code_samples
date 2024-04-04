import React from 'react';
import { Router } from 'routes';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { signOut } from 'store/auth/actions';

class LogOut extends React.Component {

    static async getInitialProps() {
        const namespacesRequired = [];
        return { namespacesRequired };
    }

    static propTypes = {
        signOut: PropTypes.func.isRequired
    };

    componentDidMount() {
        this.props.signOut();
        Router.pushRoute('/');
    }

    render() {
        return null;
    }
}
const mapDispatchToProps = { signOut };

export default connect(null, mapDispatchToProps)(LogOut);