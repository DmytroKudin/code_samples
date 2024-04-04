import * as actions from '../actions';
import expect from 'expect';
import { success } from 'redux-saga-requests';
import { initializeMockStore } from 'store/mockSaga';

const mockedActions = {
    [actions.AUTH_LOGIN]: () => {
        return {
            data: {
                data:{
                    user: 'user data',
                    token: 'token'
                }
            },
        };
    },
    [actions.AUTH_REGISTER]: () => {
        return {
            data: 'user_info'
        };
    },
    [actions.AUTH_REGISTER_SET_PASSWORD]: () => {
        return {
            data: {
                data:{
                    user: 'user data',
                    token: 'token'
                }
            },
        };
    },
    [actions.AUTH_SEND_PASSWORD_RECOVERY_EMAIL]: () => {
        return {
            data:'Success'
        };
    },
    [actions.FETCH_AUTH_USER]: () => {
        return {
            data: {
                data:{
                    user: 'user data'
                }
            },
        };
    },
    [actions.UPDATE_USER_STATUS]: () => {
        return {
            data: {
                data:{
                    user: 'user data'
                }
            },
        };
    },
    [actions.CHECK_INVITE_CODE]: () => {
        return {
            data: 'Code correct!'
        };
    },
    [actions.INVITATION_REGISTER]: () => {
        return {
            data: 'Invitation create'
        };
    },
    [actions.UPDATE_MY_PROFILE]: () => {
        return {
            data: {
                data:{
                    user: 'user data'
                }
            },
        };
    },
    [actions.SWITCH_ACTIVE_COMPANY]: () => {
        return {
            data: {
                data:{
                    user: 'user data'
                }
            },
        };
    },
    [actions.SWITCH_ACTIVE_DASHBOARD]: () => {
        return {
            data: {
                data:{
                    user: 'user data'
                }
            },
        };
    }
};
const mockStore = initializeMockStore(mockedActions);

const actionsData = [
    {
        requestAction: {
            type: actions.AUTH_LOGIN,
            request: {
                method: 'POST',
                url: 'users/token',
                data: 'credentials'
            }
        },
        toDispatch: () => actions.login('credentials')
    }, {
        requestAction: {
            type: actions.AUTH_REGISTER,
            request: {
                method: 'POST',
                url: 'users',
                data: 'data'
            }
        },
        toDispatch: () => actions.register('data')
    }, {
        requestAction: {
            type: actions.AUTH_REGISTER_SET_PASSWORD,
            request: {
                method: 'POST',
                data: 'password data',
                url: 'users/me/password'
            }
        },
        toDispatch: () => actions.setPassword('password data')
    }, {
        requestAction: {
            type: actions.AUTH_SEND_PASSWORD_RECOVERY_EMAIL,
            request: {
                method: 'DELETE',
                data: 'email',
                url: 'users/me/password'
            }
        },
        toDispatch: () => actions.passwordRecoveryEmail('email')
    }, {
        requestAction: {
            type: actions.FETCH_AUTH_USER,
            request: {
                method: 'GET',
                url: 'users/me'
            }
        },
        toDispatch: () => actions.fetchAuthUser()
    }, {
        requestAction: {
            type: actions.CHECK_INVITE_CODE,
            request: {
                method: 'GET',
                url: 'invitations/invite-code-body/user'
            }
        },
        toDispatch: () => actions.checkInviteCode('invite-code-body')
    }, {
        requestAction: {
            type: actions.INVITATION_REGISTER,
            request: {
                method: 'POST',
                url: 'invitations/invite-code-body/acceptance',
                data:{
                    code:'invite-code-body',
                    userData:'data'
                }
            }
        },
        toDispatch: () => actions.invitationRegister({
            code:'invite-code-body',
            userData:'data'
        })
    }, {
        requestAction: {
            type: actions.UPDATE_MY_PROFILE,
            request: {
                method: 'PATCH',
                url: 'users/me',
                data:{
                    userData:'data'
                }
            }
        },
        toDispatch: () => actions.updateMyProfile({
            userData:'data'
        })
    }, {
        requestAction: {
            type: actions.SWITCH_ACTIVE_COMPANY,
            request: {
                method: 'PUT',
                url: 'users/13/active/company',
                data: {
                    defaultCompanyId: 'companyId',
                }
            }
        },
        toDispatch: () => actions.switchActiveCompany('companyId','13')
    }, {
        requestAction: {
            type: actions.SWITCH_ACTIVE_DASHBOARD,
            request: {
                method: 'PUT',
                url: 'users/13/dashboard/acceptance',
                data: {
                    dashboard: 'marketplace',
                }
            }
        },
        toDispatch: () => actions.switchActiveDashboard({
            dashboard: 'marketplace',
        },'13')
    }
];

describe('async actions', () => {

    afterEach(() => {
        mockStore.clearActions();
    });

    actionsData.map(action =>
        it(`creates ${action.requestAction.type}`, async() => {
            const expectedActions = [
                action.requestAction
                ,{
                    type: success(action.requestAction.type),
                    ...mockedActions[action.requestAction.type](),
                    meta: {
                        requestAction:action.requestAction
                    }
                },
            ];

            await mockStore.dispatch(action.toDispatch());
            return expect(mockStore.getActions()).toEqual(expectedActions);
        })
    );

    it(`creates ${actions.SIGN_OUT}`, async() => {
        const expectedActions = [
            {
                type: actions.SIGN_OUT,
            }
        ];

        mockStore.dispatch(actions.signOut());
        return expect(mockStore.getActions()).toEqual(expectedActions);
    });
});
