export const SIGN_OUT = 'SIGN_OUT';
export const signOut = () => ({ type: SIGN_OUT });

export const AUTH_LOGIN = 'AUTH_LOGIN';
export const login = data => ({
    type: AUTH_LOGIN,
    request: {
        method: 'POST',
        url: 'users/token',
        data
    }
});

export const AUTH_REGISTER = 'AUTH_REGISTER';
export const register = data => ({
    type: AUTH_REGISTER,
    request: {
        method: 'POST',
        url: 'users',
        data
    }
});

export const AUTH_REGISTER_SET_PASSWORD = 'AUTH_REGISTER_SET_PASSWORD';
export const setPassword = data => ({
    type: AUTH_REGISTER_SET_PASSWORD,
    request: {
        method: 'POST',
        url: 'users/me/password',
        data
    }
});

export const AUTH_SEND_PASSWORD_RECOVERY_EMAIL = 'AUTH_SEND_PASSWORD_RECOVERY_EMAIL';
export const passwordRecoveryEmail = data => ({
    type: AUTH_SEND_PASSWORD_RECOVERY_EMAIL,
    request: {
        method: 'DELETE',
        url: 'users/me/password',
        data
    }
});

export const FETCH_AUTH_USER = 'FETCH_AUTH_USER';
export const fetchAuthUser = () => ({
    type: FETCH_AUTH_USER,
    request: {
        method: 'GET',
        url: 'users/me'
    }
});

export const UPDATE_USER_STATUS = 'UPDATE_USER_STATUS';
export const updateUserStatus = (data, userId) => ({
    type: UPDATE_USER_STATUS,
    request: {
        method: 'PUT',
        url: `users/${userId}/status`,
        data
    }
});

export const CHECK_INVITE_CODE = 'CHECK_INVITE_CODE';
export const checkInviteCode = code => ({
    type: CHECK_INVITE_CODE,
    request: {
        method: 'GET',
        url: `invitations/${code}/user`
    }
});
