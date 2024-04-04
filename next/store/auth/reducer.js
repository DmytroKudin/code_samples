import { success, error } from 'redux-saga-requests';
import {
    AUTH_LOGIN,
    AUTH_REGISTER,
    SIGN_OUT,
    AUTH_REGISTER_SET_PASSWORD,
    FETCH_AUTH_USER,
    UPDATE_USER_STATUS,
    CHECK_INVITE_CODE
} from './actions';
import { axiosController } from 'utils/axiosController';
import { STATE_STATUSES } from 'utils/stateStatuses';

export const initialState = {
    preRegisteredUser: {},
    user: {},
    status: STATE_STATUSES.INIT,
    isAuthenticated: false,
    dashboard_allowed:[],
    isInviteExist:false,
    exception: {
        message: null,
        errors: {}
    }
};

export default (state = initialState, action) => {
    switch (action.type) {
        case AUTH_LOGIN:
        case AUTH_REGISTER:
        case AUTH_REGISTER_SET_PASSWORD:
        case FETCH_AUTH_USER:
        case UPDATE_USER_STATUS: {
            return processReducer(state);
        }

        case success(AUTH_LOGIN): {
            axiosController.saveToken(action.data.data.token);
            const user = action.data.data.user;
            return {
                ...state,
                status:STATE_STATUSES.READY,
                isAuthenticated: true,
                user
            };
        }

        case success(AUTH_REGISTER): {
            return {
                ...state,
                status:STATE_STATUSES.READY,
            };
        }

        case success(AUTH_REGISTER_SET_PASSWORD): {
            axiosController.saveToken(action.data.data.token);
            return {
                ...state,
                user: action.data.data.user,
                status:STATE_STATUSES.READY,
                isAuthenticated: true
            };
        }

        case success(FETCH_AUTH_USER): {
            return {
                ...state,
                user: {
                    ...action.data.data.user,
                    role:[...new Set(action.data.data.user.role)]
                },
                status:STATE_STATUSES.READY,
                isAuthenticated: true
            };
        }

        case success(UPDATE_USER_STATUS): {
            return {
                ...state,
                status: STATE_STATUSES.READY,
                user: {...action.data.data}
            };
        }

        case success(CHECK_INVITE_CODE): {
            return {
                ...state,
                isInviteExist: true,
                preRegisteredUser: {...action.data.data}
            };
        }

        case error(FETCH_AUTH_USER): {
            axiosController.deleteToken();
            return {...state,status:STATE_STATUSES.ERROR};
        }

        case CHECK_INVITE_CODE:
        case error(CHECK_INVITE_CODE): {
            return {
                ...state,
                isInviteExist:false
            };
        }

        case error(AUTH_REGISTER):
        case error(AUTH_LOGIN):
        case error(AUTH_REGISTER_SET_PASSWORD):
        case error(UPDATE_USER_STATUS): {
            return errorReducer(action, state);
        }

        case SIGN_OUT: {
            axiosController.deleteToken();
            return {
                ...state,
                user: {},
                isAuthenticated: false
            };
        }

        default:
            return state;
    }
};

const processReducer = (state = initialState) => ({
    ...state,
    status:STATE_STATUSES.PENDING,
    exception: { ...initialState.exception }
});

const errorReducer = (exception, state = initialState) => {
    return ({
        ...state,
        status: STATE_STATUSES.ERROR,
        exception: {
            errors: {...exception.error.response.data.errors},
            message: exception.error.response.data.message
        }
    });
};
