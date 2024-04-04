import authReducer, { initialState } from '../reducer';
import * as actions from '../actions';
import expect from 'expect';
import { success, error } from 'redux-saga-requests';
import { STATE_STATUSES } from 'utils/stateStatuses';

describe('auth reducer', () => {
    it('should return the initial state', () => {
        expect(authReducer(undefined, {})).toEqual(initialState);
    });

    const initialReducers = [
        'AUTH_LOGIN',
        'AUTH_REGISTER',
        'AUTH_REGISTER_SET_PASSWORD',
        'FETCH_AUTH_USER',
        'UPDATE_USER_STATUS',
        'INVITATION_REGISTER',
        'UPDATE_MY_PROFILE',
        'SWITCH_ACTIVE_COMPANY',
        'SWITCH_ACTIVE_DASHBOARD'
    ];

    initialReducers.map((reducerType) =>
        it(`check ${reducerType}`, () => {
            const action = {
                type: actions[reducerType],
            };
            const expectedState = {
                ...initialState,
                status:STATE_STATUSES.PENDING
            };
            expect(
                authReducer(initialState,action)
            ).toEqual(expectedState);
        })
    );

    let similarReducers = [
        'AUTH_LOGIN',
        'SWITCH_ACTIVE_DASHBOARD',
        'INVITATION_REGISTER',
        'AUTH_REGISTER_SET_PASSWORD'
    ];

    similarReducers.map((reducerType) =>
        it(`check ${success(actions[reducerType])}`, () => {
            const responseData = {
                user:{},
                token:'auth token'
            };
            const action = {
                type: success(actions[reducerType]),
                data:{
                    data:responseData
                }
            };
            const expectedState = {
                ...initialState,
                status:STATE_STATUSES.READY,
                isAuthenticated: true,
                user:responseData.user
            };
            expect(
                authReducer(initialState, action)
            ).toEqual(expectedState);
        })
    );

    it(`check ${success(actions.FETCH_AUTH_USER)}`, () => {
        const responseData = {
            user:{
                role:['role1','role2']
            },
        };
        const action = {
            type: success(actions.FETCH_AUTH_USER),
            data:{
                data:responseData
            }
        };
        const expectedState = {
            ...initialState,
            status:STATE_STATUSES.READY,
            isAuthenticated: true,
            user:responseData.user
        };
        expect(
            authReducer(initialState, action)
        ).toEqual(expectedState);
    });


    it(`check ${success(actions.UPDATE_MY_PROFILE)}`, () => {
        const responseData = {
            user:{},
        };
        const action = {
            type: success(actions.UPDATE_MY_PROFILE),
            data:{
                data:responseData
            }
        };
        const expectedState = {
            ...initialState,
            status:STATE_STATUSES.READY,
            user:responseData.user
        };
        expect(
            authReducer(initialState, action)
        ).toEqual(expectedState);
    });

    it(`check ${success(actions.AUTH_REGISTER)}`, () => {
        const responseData = {
            user:{},
        };
        const action = {
            type: success(actions.AUTH_REGISTER),
            meta:{
                requestAction:{
                    request:{
                        data:{
                            role:'worker'
                        }
                    }
                }
            },
            data:{
                data:responseData
            }
        };
        const expectedState = {
            ...initialState,
            status:STATE_STATUSES.READY,
        };
        expect(
            authReducer(initialState, action)
        ).toEqual(expectedState);
    });

    it(`check ${success(actions.AUTH_REGISTER)}`, () => {
        const responseData = {
            user:{},
        };
        const action = {
            type: success(actions.AUTH_REGISTER),
            meta:{
                requestAction:{
                    request:{
                        data:{
                            role:'user'
                        }
                    }
                }
            },
            data:{
                data:responseData
            }
        };
        const expectedState = {
            ...initialState,
            status:STATE_STATUSES.READY,
        };
        expect(
            authReducer(initialState, action)
        ).toEqual(expectedState);
    });

    it(`check ${success(actions.UPDATE_USER_STATUS)}`, () => {
        const responseData = {};
        const action = {
            type: success(actions.UPDATE_USER_STATUS),
            data: {
                data: responseData
            }

        };
        const expectedState = {
            ...initialState,
            status:STATE_STATUSES.READY,
            user:responseData
        };
        expect(
            authReducer(initialState, action)
        ).toEqual(expectedState);
    });


    let errorReducers = [
        'AUTH_REGISTER',
        'INVITATION_REGISTER',
        'SWITCH_ACTIVE_DASHBOARD',
        'AUTH_LOGIN',
        'AUTH_REGISTER_SET_PASSWORD',
        'UPDATE_USER_STATUS',
        'UPDATE_MY_PROFILE',
        'SWITCH_ACTIVE_COMPANY',
    ];

    errorReducers.map((reducerType) =>
        it(`check ${error(actions[reducerType])}`, () => {
            const responseData = {
                response:{
                    data:{
                        message:'Error message text',
                        errors: {
                            email:'Wrong email'
                        }
                    }
                }
            };
            const action = {
                type: error(actions[reducerType]),
                error:responseData
            };
            const expectedState = {
                ...initialState,
                status:STATE_STATUSES.ERROR,
                exception: {
                    errors: {...responseData.response.data.errors},
                    message: responseData.response.data.message
                }
            };
            expect(
                authReducer(initialState, action)
            ).toEqual(expectedState);
        })
    );

    it(`check ${error(actions.FETCH_AUTH_USER)}`, () => {
        const action = {
            type: error(actions.FETCH_AUTH_USER)
        };
        const expectedState = {
            ...initialState,
            status:STATE_STATUSES.ERROR,
        };
        expect(
            authReducer(initialState, action)
        ).toEqual(expectedState);
    });

    it(`check ${actions.CHECK_INVITE_CODE}`, () => {
        const action = {
            type: actions.CHECK_INVITE_CODE
        };
        const expectedState = {
            ...initialState,
            isInviteExist:false
        };
        expect(
            authReducer(initialState, action)
        ).toEqual(expectedState);
    });

    it(`check ${success(actions.CHECK_INVITE_CODE)}`, () => {
        const action = {
            type: success(actions.CHECK_INVITE_CODE),
            data: {
                data: {}
            }
        };
        const expectedState = {
            ...initialState,
            isInviteExist:true
        };
        expect(
            authReducer(initialState, action)
        ).toEqual(expectedState);
    });

    it(`check ${error(actions.CHECK_INVITE_CODE)}`, () => {
        const action = {
            type: error(actions.CHECK_INVITE_CODE)
        };
        const expectedState = {
            ...initialState,
            isInviteExist:false
        };
        expect(
            authReducer(initialState, action)
        ).toEqual(expectedState);
    });

    it(`check ${success(actions.SWITCH_ACTIVE_COMPANY)}`, () => {
        const action = {
            type: success(actions.SWITCH_ACTIVE_COMPANY),
            data: {
                data: {
                    defaultCompanyId:'company_id'
                }
            }

        };
        const expectedState = {
            ...initialState,
            user:{
                ...initialState.user, defaultCompanyId:action.data.data.defaultCompanyId
            },
            status:STATE_STATUSES.READY
        };
        expect(
            authReducer(initialState, action)
        ).toEqual(expectedState);
    });

    it(`check ${actions.SIGN_OUT}`, () => {
        const action = {
            type: actions.SIGN_OUT
        };
        expect(
            authReducer(initialState, action)
        ).toEqual(initialState);
    });

});
