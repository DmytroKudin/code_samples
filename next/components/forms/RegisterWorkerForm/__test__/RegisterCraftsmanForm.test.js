import React from 'react';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import configureMockStore from 'redux-mock-store';
import 'jest-styled-components';
import { RegisterWorkerForm } from 'components/forms/RegisterWorkerForm';
import { defaultRadius, defaultCenter } from 'components/forms/RegisterWorkerForm/constants';
import { getZipCode } from 'utils/helpers';

jest.mock('utils/helpers');
getZipCode.mockResolvedValue({
    response: {
        results: [{
            formatted_address: '10117 London England',
            geometry:{
                location:{
                    lat: 52.52437,
                    lng: 13.41053
                }
            }
        }]
    },
    zipCode:10117
});

describe('RegisterWorkerForm', () => {
    const mockFetchJobCategories = jest.fn().mockResolvedValue();
    const mockRegister = jest.fn();
    const props = {
        fetchJobCategories: mockFetchJobCategories,
        register: mockRegister,
        categories: [],
        router: {query: 'query'},
    };

    const initialState = {
        address: '',
        initAddress:'',
        radius: defaultRadius,
        center: defaultCenter,
        place: null,
        isTerms: false,
        isPolicy: false,
        currentStep: 1,
        workerSkills: [],
        isSuccess: false,
        zipCode: 10117,
        email: '',
    };

    const testData = {
        firstName: 'firstName',
        lastName: 'lastName',
        phoneNumber: '+49555555555',
        email: 'doe@test.com',
        companyName: 'companyName',
        partnerName: 'partnerName',
    };

    let wrapper;
    beforeEach(() => {
        wrapper = mount(<RegisterWorkerForm {...props} />);
    });

    it('render correctly RegisterWorkerForm component by default', () => {
        expect(wrapper.exists()).toBe(true);
    });
    it('initialize RegisterWorkerForm with initial state', () => {
        expect(wrapper.state()).toEqual(initialState);
    });
    it('initialize RegisterWorkerForm with initAddress', () => {
        wrapper.setState({ initAddress: '10117 London England' });
        expect(wrapper.state().initAddress).toEqual('10117 London England');
    });
    const funcData = [
        { spy: 'handleValidation', handler: 'validate'},
        { spy: 'handleSubmit', handler: 'onSubmit'},
    ];
    funcData.map(item => {
        it(`should call ${item.spy} func on change input`, () => {
            const instance = wrapper.instance();
            jest.spyOn(instance, item.spy);
            const form = wrapper.find('ReactFinalForm');
            expect(form.props()[item.handler]).toBeDefined();
            form.props()[item.handler](testData);
            expect(instance[item.spy]).toBeCalledTimes(1);
            if(item.handler === 'onSubmit') {
                expect(wrapper.state().currentStep).toEqual(2);
                form.props().onSubmit(testData);
                expect(wrapper.state().email).toEqual(testData.email);
            }
        });
    });
    const selectData = [
        { event: { id: ''}, func: 'onPlaceSelected' },
        { event: { id: 'id', geometry: { location: { lat: () => 48.85341, lng: () => 2.3488 }} }, func: 'onPlaceSelected' },
        { event: { id: 'id', preventDefault: jest.fn(), key: 'Enter' }, func: 'onKeyPress',  },
        { event: { id: 'id', preventDefault: jest.fn(), target: {value: 'address'} }, func: 'onChange',  }
    ];
    selectData.map(item => {
        it(`should call handleOnPlace and place id = ${item.event.id} and ${item.func} input`, () => {
            const instance = wrapper.instance();
            jest.spyOn(instance, 'handleOnPlace');
            const field = wrapper.find('div.selects-block').childAt(0);
            expect(field.props()[item.func]).toBeDefined();
            field.props()[item.func](item.event);
            if(item.func === 'onChange') {
                expect(wrapper.state()[item.event.target.value]).toEqual(item.event.target.value);
            } else {
                expect(instance.handleOnPlace).toBeCalledTimes(1);
            }
        });
    });
    it('should set state radius on change input', () => {
        const elem = wrapper.find('Select').first();
        expect(elem.props().onChange).toBeDefined();
        elem.props().onChange(50);
        expect(wrapper.state('radius')).toEqual(50);
    
    });
    const actionData = [
        { currentStep: 2, props: 'prevProps'},
        { currentStep: 2, props: 'nextProps'}
    ];
    actionData.map(item => {
        it(`should set currentStep on call ${item.props} action func`, () => {
            const buttons = wrapper.find('NavigationButtons');
            expect(buttons.exists()).toBe(true);
            expect(buttons.props()[item.props].action).toBeDefined();
            buttons.props()[item.props].action();
            expect(wrapper.state().currentStep).toEqual(1);
        });
    });
    const skillsData = [
        { currentStep: 2, value: 'skills1', workerSkills: [], expect: ['skills1']},
        { currentStep: 2, value: 'skills1', workerSkills: ['skills1', 'skills2'], expect: ['skills2']}
    ];
    skillsData.map(item => {
        it(`should call onCategorySelectBlockClick and initialState skills = ${item.workerSkills}`, () => {
            const instance = wrapper.instance();
            jest.spyOn(instance, 'onCategorySelectBlockClick');
            wrapper.setState({currentStep: item.currentStep, workerSkills: item.workerSkills});
            const box = wrapper.find('CategorySelectBox');
            expect(box.props().onChange).toBeDefined();
            box.props().onChange(item.value);
            expect(instance.onCategorySelectBlockClick).toBeCalledTimes(1);
            expect(wrapper.state().workerSkills).toEqual(item.expect);
        });
    });
    describe('RegisterWorkerForm mapStateToProps & mapDispatchToProps', () => {
        const middlewares = [thunk];
        const mockStore = configureMockStore(middlewares);
        const initialState = {
            auth: {
                status: 'status',
            }
        };
        let store;
        let wrapper;
        beforeEach(() => {
            store = mockStore(initialState);
            wrapper = mount(<Provider store={store}><RegisterWorkerForm {...props} /></Provider>);
        });
        it('the state values were correctly passed as props', () => {
            expect(store.getState()).toEqual(initialState);
        });
        it('mapStateToProps should return the right value', () => {
            expect(wrapper.props().store.getState().auth.status).toBe(initialState.auth.status);
        });
    });
});
