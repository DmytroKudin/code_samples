import React from 'react';
import checkAuth from '../checkAuth';
import 'jest-styled-components';
import { shallow } from 'enzyme';
import { parseCookies } from 'nookies';
import { axiosController } from 'utils/axiosController';
import { Router } from 'routes';

jest.mock('utils/axiosController', () => ({
    axiosController: {
        setAuthHeader: jest.fn(),
        deleteToken: jest.fn(),
    },
}));

jest.mock('routes');

jest.mock('nookies', () => ({
    parseCookies: jest.fn(() => ({
        projectToken: 'projectToken',
    })),
}));

const setup = () => {
    const TestComponent = class TestComponent extends React.Component {
        static async getInitialProps() {
            return;
        }
        render() {
            return <p>Test</p>;
        }
    };
    const ComponentWithWrapper = checkAuth(TestComponent);
    const shallowWrapper = shallow(<ComponentWithWrapper />);
    return {
        ComponentWithWrapper,
        shallowWrapper,
    };
};

describe('Component: check Auth hoc', () => {
    let enzymeWrapper, wrapper;
    beforeEach(() => {
        const { ComponentWithWrapper, shallowWrapper } = setup();
        wrapper = ComponentWithWrapper;
        enzymeWrapper = shallowWrapper;
    });
    it('should render self and subcomponents', () => {
        expect(enzymeWrapper.exists()).toBe(true);
    });
    it('should check getInitialProps method', async () => {
        let testCtx = {
            reduxStore: {
                getState: jest.fn(() => ({
                    auth: {
                        isAuthenticated: false,
                    },
                })),
                dispatch: jest.fn(),
            },
            res: {
                writeHead: jest.fn(),
                end: jest.fn(),
            },
            asPath: 'links:dashboard.root',
        };

        testCtx.reduxStore.dispatch = jest.fn().mockRejectedValue(new Error('Async error'));
        wrapper.getInitialProps(testCtx).catch(() => {
            expect(axiosController.deleteToken).toBeCalled();
        });

        testCtx.reduxStore.dispatch = jest.fn();
        await wrapper.getInitialProps(testCtx);

        expect(testCtx.reduxStore.getState).toBeCalled();
        expect(parseCookies).toBeCalled();
        expect(axiosController.setAuthHeader).toBeCalled();
        expect(testCtx.res.writeHead).toBeCalled();
        expect(testCtx.res.end).toBeCalled();

        testCtx = {
            ...testCtx,
            res: undefined,
        };

        await wrapper.getInitialProps(testCtx);
        expect(Router.pushRoute).toBeCalled();

        testCtx = {
            reduxStore: {
                getState: jest.fn(() => ({
                    auth: {
                        isAuthenticated: true,
                    },
                })),
                dispatch: jest.fn(),
            },
            res: {
                writeHead: jest.fn(),
                end: jest.fn(),
            },
            asPath: 'links:login',
        };

        await wrapper.getInitialProps(testCtx);
        expect(testCtx.res.writeHead).toBeCalled();
        expect(testCtx.res.end).toBeCalled();

        testCtx = {
            ...testCtx,
            res: undefined,
        };

        await wrapper.getInitialProps(testCtx);
        expect(Router.pushRoute).toBeCalled();
    });
});
