if (__DEV__) {
  import('ReactotronConfig.js').then(() =>
    console.log('Reactotron Configured'),
  );
}

import React, {useEffect} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import NavigationRoot from '@navigation/NavigationRoot';
import {useColorScheme} from 'react-native';
import {ThemeProvider} from '@rneui/themed';
import {darkTheme, lightTheme} from '@styles/theme';
import {Provider} from 'react-redux';
import {store} from '@store/index.js';
import SplashScreen from 'react-native-splash-screen';

const App = () => {
  const deviceTheme = useColorScheme();
  const isDarkMode = deviceTheme === 'dark';

  useEffect(() => {
    SplashScreen.hide();
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
        <SafeAreaProvider>
          <NavigationRoot />
        </SafeAreaProvider>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
