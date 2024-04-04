import {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {checkAuth} from '@utils/asyncStorage.ts';
import {setAuthorized} from '@store/slices/appSlice.js';
import {store} from '@store/index.js';

export type RootState = ReturnType<typeof store.getState>;

const AppNavigator = () => {
  const dispatch = useDispatch();
  const isAuthorized = useSelector(
    (state: RootState) => state.app.isAuthorized,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth().then(auth => {
      if (auth) {
        dispatch(setAuthorized(true));
      }
      setLoading(false);
    });
  }, [dispatch]);

  if (loading) {
    return null;
  }

  if (isAuthorized) {
    const AuthScreens = require('@screens/AuthScreens').default;
    return <AuthScreens />;
  }

  const PublicScreens = require('@screens/PublicScreens').default;
  return <PublicScreens />;
};

AppNavigator.displayName = 'AppNavigator';
export default AppNavigator;
