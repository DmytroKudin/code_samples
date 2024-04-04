import { createRequestInstance, watchRequests } from 'redux-saga-requests';
import { createDriver } from 'redux-saga-requests-axios';
import { axiosController } from 'utils/axiosController';
import { i18n } from 'i18n';
import Alert from 'react-s-alert';
import { Router } from 'routes';

axiosController.setBaseUrl();
export default function* rootSaga() {
    yield createRequestInstance({
        driver: createDriver(axiosController.getAxiosInstace()),
        onError: onErrorSaga,
    });
    yield watchRequests();
}

const onErrorSaga = (error) => {
    const { response } = error;
    if ( response && response.status === 401 && process.browser ) {
        const { pathname } = Router.router;
        if( pathname!==i18n.t('links:login') ) {
            window.location = i18n.t('links:login');
        }
    }
    if (!response) {
        Alert.error(i18n.t('common:networkError'));
    }

    return { error };
};
