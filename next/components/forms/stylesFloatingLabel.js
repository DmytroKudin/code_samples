import {
    floatingStyles,
    focusStyles,
    inputStyles,
    labelStyles
} from 'floating-label-react';

const inputStyle = {
    span: {
        boxSizing: 'border-box',
        left: 0,
        pointerEvents: 'none',
        position: 'absolute',
        top: 0,
        zIndex: 1,
        fontSize: '15px',
        color: '#C1C7D0',
        fontFamily: 'Space Grotesk',
        lineHeight: '24px',
        padding: '14.5px 0 17.5px',
        transition: '.2s'
    },
    floating: {
        ...floatingStyles,
        padding: 0,
        fontSize: '10px',
        color: '#505F79'
    },
    focus: {
        ...focusStyles,
        borderColor: 'blue',
        outline: 'none'
    },
    input: {
        ...inputStyles,
        border: 'none',
        boxSizing: 'border-box',
        minHeight: '55px',
        padding: '9px 0 0 0',
        borderBottom: 'none',
        fontSize: '15px',
        fontFamily: 'Space Grotesk',
        width: '100%',
        background: 'transparent',
        color: '#505F79',
        fontWeight: '500',
        lineHeight: '24px',
    },
    label: {
        ...labelStyles,
        boxSizing: 'border-box',
        display: 'inline-block',
        paddingTop: 5,
        position: 'relative',
        color: '#A5ADBA',
        fontFamily: 'Space Grotesk',
        letterSpacing: '0.2px',
        lineHeight: '16px',
        width: '100%',
        padding: '0 5px 0 0',
        marginBottom: '0px'
    }
};

export default inputStyle;