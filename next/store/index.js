import { applyMiddleware, createStore, combineReducers } from 'redux';
import { createLogger } from 'redux-logger';
import createSagaMiddleware from 'redux-saga';
import { requestsPromiseMiddleware } from 'redux-saga-requests';
import { ENABLE_LOGGER } from 'config/app';

import auth from './auth/reducer';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk';
import saga from './saga';

const loggerMiddleware = createLogger();
const sagaMiddleware = createSagaMiddleware();

const appReducer = combineReducers({
    auth
});

const rootReducer = (state, action) => {
    if (action.type === 'SIGN_OUT') {
        state = undefined;
    }

    return appReducer(state, action);
};

export let storeInstance;

export function initializeStore(initialState = undefined) {
    const middlewares = [
        requestsPromiseMiddleware({auto: true}),
        thunkMiddleware,
        sagaMiddleware,
    ];

    if ( process.browser && ENABLE_LOGGER === 'true' ) {
        middlewares.push(loggerMiddleware);
    }

    const store = createStore(rootReducer, initialState, composeWithDevTools(applyMiddleware(...middlewares)));
    sagaMiddleware.run(saga);
    storeInstance = store;
    return store;
}
