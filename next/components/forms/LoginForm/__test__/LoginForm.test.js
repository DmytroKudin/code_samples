import React from 'react';
import { mount } from 'enzyme';
import { LoginForm } from '../LoginForm';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import 'jest-styled-components';
import { act } from 'react-dom/test-utils';

function setup() {
    const testData = {
        email: 'testEmail@mail.com',
        password: 'password',
    };

    const props = {
        login: jest.fn(),
        isWorkerplace: false,
    };

    const state = {
        error: {
            show: true,
            text: 'Some Text',
            hideMail: true,
        },
    };

    const middlewares = [thunk];
    const mockStore = configureMockStore(middlewares);
    const initialState = {
        getState: jest.fn(() => ({})),
        dispatch: jest.fn(),
        subscribe: jest.fn(),
    };
    const store = mockStore(initialState);

    const enzymeWrapper = mount(
        <Provider store={store}>
            <LoginForm {...props} />
        </Provider>,
    );

    return {
        props,
        state,
        enzymeWrapper,
        testData,
    };
}

jest.mock('next/router');

describe('Component: LoginForm (Snapshot) ', () => {
    it('should render self and subcomponents', () => {
        const { enzymeWrapper } = setup();

        expect(enzymeWrapper.exists()).toBe(true);
        expect(enzymeWrapper).toMatchSnapshot();
    });
    it('validate function should be defined', function() {
        const { enzymeWrapper, testData } = setup();

        const form = enzymeWrapper.find('ReactFinalForm');
        act(() => {
            form.props().validate(testData);
        });
        expect(form.props().validate).toBeDefined();
    });
    it('should correctly work closeHandler method on ConfirmPopup', function() {
        const { enzymeWrapper } = setup();

        const popup = enzymeWrapper.find('ConfirmPopup');
        expect(popup.props().closeHandler).toBeDefined();
        act(() => {
            popup.props().closeHandler();
        });
    });
});
