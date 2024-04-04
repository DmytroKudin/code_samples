import {createStackNavigator} from '@react-navigation/stack';
import defaultScreenOptions from '@screens/defaultScreenOptions.ts';
import SCREENS from '@constants/screens.ts';
import SignInScreen from '@screens/PublicScreens/SignInScreen';
import ForgotPasswordScreen from '@screens/PublicScreens/ForgotPasswordScreen';

const {Navigator, Screen} = createStackNavigator();

const PublicScreens = () => {
  return (
    <Navigator screenOptions={defaultScreenOptions}>
      <Screen
        name={SCREENS.SIGN_IN}
        component={SignInScreen}
        options={{headerShown: false}}
      />
      <Screen name={SCREENS.FORGOT_PASSWORD} component={ForgotPasswordScreen} />
    </Navigator>
  );
};

export default PublicScreens;
