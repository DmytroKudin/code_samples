import React, { useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Link, Router } from 'routes';
import { Field, Form } from 'react-final-form';

import { i18n } from 'i18n';
import { login } from 'store/auth/actions';
import { Styles, BackgroundBody } from './styles';
import Input from 'inputs/Input';
import _get from 'lodash/get';
import ConfirmPopup from 'components/general/ConfirmPopup';
import ProjectButton from 'components/general/ProjectButton';
import { DISABLE_WORKERPLACE } from 'config/app';
import { validationEmail, validationPassword } from 'utils/validationController';
import { staticUrl } from 'utils/assetHelper';

export const LoginForm = ({ login }) => {
    const [error, setError] = useState({
        show: false,
        text: '',
        hideMail: false,
    });
    const { show, text, hideMail } = error;

    const handleValidation = values => {
        const { email, password } = values;
        const errors = {};

        errors.email = validationEmail(email);
        errors.password = validationPassword(password);
        return errors;
    };

    const onSubmit = async values => {
        const { email, password } = values;
        const data = {
            email,
            password,
        };

        try {
            const userData = await login(data);
            const { user } = userData.data.data;
            redirectToDashboard(user.activeDashboard);
        } catch (e) {
            const reasonText = _get(e, 'error.response.data.errors.reason');
            const text = reasonText
                ? i18n.t(`forms:loginForm.${reasonText}`)
                : i18n.t('forms:loginForm.wrong_credentials');

            setError({
                show: true,
                text,
                hideMail: true,
            });
        }
    };

    const redirectToDashboard = (activeDashboard) => {
        Router.pushRoute(activeDashboard);
    };

    return (
        <Styles>
            <BackgroundBody />
            <div className='base'>
                <div className='left-side'>
                    <Form
                        onSubmit={values => onSubmit(values)}
                        validate={values => handleValidation(values)}
                        render={({ handleSubmit }) => (
                            <form onSubmit={handleSubmit} className='form'>
                                <h1 className='login-title'>{i18n.t('forms:loginForm.title')}</h1>
                                <p className='login-subtitle'>{i18n.t('forms:loginForm.loginText')}</p>
                                <div className='loginFieldsWrapper'>
                                    <Field
                                        name={'email'}
                                        placeholder={i18n.t('forms:loginForm.emailTitle')}
                                        type={'email'}
                                        id={'email-field'}
                                        component={Input}
                                    />
                                    <Field
                                        name={'password'}
                                        placeholder={i18n.t('forms:loginForm.passwordTitle')}
                                        type={'password'}
                                        id={'password-field'}
                                        component={Input}
                                    />
                                    <div className='footer-login'>
                                        <Link route={i18n.t('links:recovery')}>
                                            <a className='footer-link'>
                                                {i18n.t('forms:loginForm.recoverPasswordTitle')}
                                            </a>
                                        </Link>
                                        <ProjectButton type='submit'>
                                            {i18n.t('forms:loginForm.buttonTitle')}
                                        </ProjectButton>
                                    </div>
                                </div>
                            </form>
                        )}
                    />
                    {DISABLE_WORKERPLACE !== 'true' && (
                        <div className='workerplace'>
                            <div className='divider-container'>
                                <hr className='divider' size='1' color='#c1c7d0' />
                                <span>{i18n.t('forms:loginForm.dividerText')}</span>
                                <hr className='divider' size='1' color='#c1c7d0' />
                            </div>
                            <div className='btn-group'>
                                <Link route={i18n.t('links:workerplace.register')}>
                                    <a className='basic-button secondary-button normal workerplace-button'>
                                        {i18n.t('forms:loginForm.newMemberButton')}
                                    </a>
                                </Link>
                                <Link route={i18n.t('links:workerplace.invite-code')}>
                                    <a className='basic-button secondary-button normal workerplace-button'>
                                        {i18n.t('forms:loginForm.inviteCodeButton')}
                                    </a>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
                <div className='login-main-image'>
                    <img loading='lazy' src={staticUrl('images', 'login-image.png')} alt='main login image' width='646' />
                </div>
            </div>
            <ConfirmPopup
                confirmText={text}
                confirmTitle={i18n.t('forms:loginForm.confirmPopupTitle')}
                buttonText={i18n.t('forms:loginForm.confirmPopupButtonText')}
                show={show}
                hideMail={hideMail}
                closeHandler={() => setError({ ...error, show: false, hideMail: false })}
            />
        </Styles>
    );
};

LoginForm.propTypes = {
    login: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({ ...state.auth });

export default connect(
    mapStateToProps,
    { login },
)(LoginForm);
