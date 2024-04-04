import React, { Component } from 'react';
import { Field, Form } from 'react-final-form';
import { Router } from 'routes';
import Alert from 'react-s-alert';
import { i18n } from 'i18n';
import { validationConfirmPassword, validationPassword } from 'utils/validationController';
import Styles from './styles';
import PropTypes from 'prop-types';
import Input from 'components/inputs/Input';
import {MARKETPLACE, WORKERPLACE} from 'config/app';

class SetPasswordForm extends Component {
    static propTypes = {
        setPassword: PropTypes.func,
        query: PropTypes.object
    };

    static defaultProps = {
        setPassword: () => {},
    };

    handleValidation = values => {
        const { password, passwordConfirmation } = values;
        const errors = {};
        errors.password = validationPassword(password);
        errors.passwordConfirmation = validationConfirmPassword(
            password,
            passwordConfirmation
        );
        return errors;
    };

    onSubmit = async values => {
        const { setPassword, query: { token } } = this.props;
        const { password, passwordConfirmation } = values;

        const data = {
            password,
            passwordConfirmation,
            confirmToken: token,
        };

        try {
            const response = await  setPassword(data);
            const { user } = response.data.data;
            if (user.avatarUrl !== null) {
                if (user.activeDashboard === WORKERPLACE){
                    Router.pushRoute(`${i18n.t('links:workerplace.root')}/${i18n.t('links:workerplace.dashboard.root')}`);
                } else if(user.activeDashboard === MARKETPLACE){
                    Router.pushRoute(i18n.t('links:dashboard.root'));
                } else {
                    Router.pushRoute('/');
                }
            } else {
                Router.pushRoute(i18n.t('links:set-avatar'));
            }
        } catch (e) {
            Alert.error(i18n.t('forms:setPasswordForm.tokenWrong'));
        }
    };

    render() {
        return (
            <Styles>
                <div className={'bg'} />
                <div className="base">
                    <Form
                        onSubmit={values => this.onSubmit(values)}
                        validate={values => this.handleValidation(values)}
                        render={({ handleSubmit, pristine, invalid }) => (
                            <form onSubmit={handleSubmit} className="form">
                                <h2 className="title">
                                    {i18n.t('forms:setPasswordForm.title')}
                                </h2>
                                <h3 className="subTitle">
                                    {i18n.t('forms:setPasswordForm.welcome')}
                                </h3>
                                <Field
                                    name={'password'}
                                    placeholder={i18n.t('forms:setPasswordForm.passwordTitle')}
                                    type={'password'}
                                    component={Input}
                                    maxLength={32}
                                />
                                <Field
                                    name={'passwordConfirmation'}
                                    placeholder={i18n.t('forms:setPasswordForm.confirmPasswordTitle')}
                                    type={'password'}
                                    component={Input}
                                    maxLength={32}
                                />
                                <div className="btn">
                                    <button
                                        type="submit"
                                        className="button"
                                        disabled={pristine || invalid}
                                    >
                                        {i18n.t('forms:setPasswordForm.buttonTitle')}
                                    </button>
                                </div>
                            </form>
                        )}
                    />
                </div>
            </Styles>
        );
    }
}

export default SetPasswordForm;
