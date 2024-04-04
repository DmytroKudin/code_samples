import axios from 'axios';
import Config from 'react-native-config';
import getToken from '@utils/getToken';

const BaseAxiosInstance = axios.create({
  baseURL: Config.API_URL,
  responseType: 'json',
});

let requestPending = 0;

BaseAxiosInstance.interceptors.request.use(async req => {
  if (!req.silent) {
    requestPending++;
  }
  const headers = {...req.headers};

  if (!headers.Authorization && !headers.noAuth) {
    const token = await getToken();
    if (token) {
      headers.Authorization = token;
    }
  }

  return {
    ...req,
    headers,
  };
});

BaseAxiosInstance.interceptors.response.use(
  config => {
    requestPending = Math.max(0, --requestPending);
    return config;
  },
  err => {
    requestPending = Math.max(0, --requestPending);
    return Promise.reject(err);
  },
);

const Cache = {};
const GroupRequests = {};

const apiClient = ({useCache, useGroup, ...params}) => {
  return new Promise((resolve, reject) => {
    const cacheKey = JSON.stringify(params);

    const handleSuccess = res => {
      if (useCache) {
        Cache[cacheKey] = res;
      }
      resolve(res);
    };

    const handleError = error => {
      if (axios.isCancel(error)) {
        return;
      }
      reject(error);
    };

    if (useCache && cacheKey in Cache) {
      return resolve(Cache[cacheKey]);
    }

    if (useGroup && cacheKey in GroupRequests) {
      GroupRequests[cacheKey].then(handleSuccess).catch(handleError);
      return;
    }

    if (useGroup) {
      GroupRequests[cacheKey] = BaseAxiosInstance(params);
      GroupRequests[cacheKey]
        .then(handleSuccess)
        .catch(handleError)
        .finally(() => {
          delete GroupRequests[cacheKey];
        });
      return;
    }

    BaseAxiosInstance(params).then(handleSuccess).catch(handleError);
  });
};

export default apiClient;
