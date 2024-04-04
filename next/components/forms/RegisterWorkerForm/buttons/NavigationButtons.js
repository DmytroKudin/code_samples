import Styled from './ButtonsStyles';
import { i18n } from 'i18n';
import React from 'react';
import PropTypes from 'prop-types';

const StepButton = (
    ({ label, action, className, disabled = false }) => (
        <div
            className={`${className} ${disabled ? 'disabled' : ''}`.trim()}
            onClick={disabled ? undefined : action}
        >
            {label}
        </div>
    )
);

const NavigationButtons = ({ prevProps, nextProps }) => {
    const style = prevProps.show ? {marginLeft: '-10px'} : {};

    return (
        <Styled>
            <div className='buttons-block' style={style}>
                <>
                    {prevProps.show && <StepButton className="buttons-back" label={i18n.t('forms:RegisterWorkerForm.buttons.back')} {...prevProps} /> }
                    <StepButton className="buttons-next" label={i18n.t('forms:RegisterWorkerForm.buttons.next')} {...nextProps} />
                </>
            </div>
        </Styled>
    );
};

StepButton.propTypes = {
    label:PropTypes.string,
    action:PropTypes.func,
    className: PropTypes.string,
    disabled: PropTypes.bool,
};

NavigationButtons.propTypes = {
    prevProps:PropTypes.object,
    nextProps:PropTypes.object
};

export default NavigationButtons;
