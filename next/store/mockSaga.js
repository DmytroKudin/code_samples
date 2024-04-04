import { createRequestInstance, watchRequests } from 'redux-saga-requests';
import { createDriver } from 'redux-saga-requests-mock';
import thunkMiddleware from 'redux-thunk';
import {requestsPromiseMiddleware} from 'redux-saga-requests';
import configureMockStore from 'redux-mock-store';
import createSagaMiddleware from 'redux-saga';

const sagaMiddleware = createSagaMiddleware();

export function initializeMockStore(driverMockData={}) {
    const middlewares = [
        thunkMiddleware,
        requestsPromiseMiddleware({auto: true}),
        sagaMiddleware,
    ];

    const mockStore = configureMockStore(middlewares);
    const store = new mockStore();
    sagaMiddleware.run(()=>rootSaga(driverMockData));

    return store;
}

export function* rootSaga(driverMockData={}) {
    yield createRequestInstance({
        driver: createDriver(
            {...driverMockData}
        ),
    });
    yield watchRequests();
}