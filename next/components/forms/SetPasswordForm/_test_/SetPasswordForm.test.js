import React from 'react';
import { shallow, mount } from 'enzyme';
import 'jest-styled-components';
import SetPasswordForm from 'components/forms/SetPasswordForm';
import { MARKETPLACE, WORKERPLACE } from 'config/app';

describe('SetPasswordForm', () => {
    const mockSetPassword = ((avatarUrl, side)=>{
        return {
            data: {
                data: {
                    user: {
                        avatarUrl,
                        side
                    }
                }
            }
        };
    });
    const testData = {
        password: 'password',
        passwordConfirmation: 'password',
    };
    const avatarUrl = 'avatarUrl';
    const ANOTHER_SIDE = 'another';

    const props = {
        query: {
            token: 'token',
        },
    };

    const mountWrapper = mount(<SetPasswordForm {...props} />);
    const shallowWrapper = shallow(<SetPasswordForm {...props} />);

    it('render correctly SetPasswordForm component by default', () => {
        expect(mountWrapper.exists()).toBe(true);
        expect(mountWrapper).toMatchSnapshot();
        expect(mountWrapper.props().setPassword).toBeDefined();
        mountWrapper.props().setPassword();
    });
    it('should call handleValidation func on change input', () => {
        expect(shallowWrapper.exists()).toBe(true);
        const instance = shallowWrapper.instance();
        jest.spyOn(instance, 'handleValidation');
        const form = shallowWrapper.find('ReactFinalForm');
        expect(form.props().validate).toBeDefined();
        form.props().validate(testData);
        expect(instance.handleValidation).toBeCalledTimes(1);
    });

    const sideData = [
        { side: WORKERPLACE, avatarUrl },
        { side: MARKETPLACE, avatarUrl },
        { side: ANOTHER_SIDE, avatarUrl },
        { side: ANOTHER_SIDE, avatarUrl: null },
    ];

    sideData.map(item => {
        it(`submits valid form if avatarUrl === ${item.avatarUrl} and side === ${item.side}`, () => {
            mountWrapper.setProps({ setPassword: () =>  mockSetPassword(item.avatarUrl, item.side) });
            const form = mountWrapper.find('ReactFinalForm');
            expect(form.props().onSubmit).toBeDefined();
            form.props().onSubmit(testData);
        });
    });

    const inputData = [
        { pristine: true, invalid: false, side: ANOTHER_SIDE, avatarUrl },
        { pristine: false, invalid: true, side: ANOTHER_SIDE, avatarUrl }
    ];

    inputData.map(item => {
        it(`submit button disabled if pristine === ${item.pristine} and invalid === ${item.invalid}`, () => {
            const renderData = {
                handleSubmit: jest.fn(),
                pristine: item.pristine,
                invalid: item.invalid,
            };
            mountWrapper.setProps({ setPassword: () =>  mockSetPassword(item.avatarUrl, item.side) });
            const form = mountWrapper.find('ReactFinalForm');
            expect(form.props().render).toBeDefined();
            form.props().render(renderData);
            const button = mountWrapper.find('.button');
            expect(button.exists()).toBe(true);
            expect(button.prop('disabled')).toBe(true);
        });
    });
});
