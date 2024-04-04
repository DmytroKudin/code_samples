import {
  Keyboard,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {CheckBox, Text} from '@rneui/themed';
import {FC, useCallback, useEffect, useState} from 'react';
import {useFormik} from 'formik';
import Orientation from 'react-native-orientation-locker';

import IconButton from '@components/IconButton';
import Button from '@components/Button';
import Input from '@components/Input';
import SCREENS from '@constants/screens.ts';
import {loginValidationSchema} from '@validations/loginValidation.ts';
import {useLoginMutation} from '@api/authApi.js';
import {
  NavigationProp,
  ParamListBase,
  useFocusEffect,
} from '@react-navigation/native';
import {asyncStorageSetToken} from '@utils/asyncStorage.ts';
import {ORG_ROLE, ROLE_TOKEN_MAP} from '@constants/api.ts';
import {RoleType} from '@/types/role';
import {useDispatch} from 'react-redux';
import {setAuthorized} from '@store/slices/appSlice.js';

const initialValues = {
  username: '',
  password: '',
  rememberMe: false,
};

const success = 'Authorized successfully';

interface SignInScreenProps {
  navigation: NavigationProp<ParamListBase, any>;
}

const SignInScreen: FC<SignInScreenProps> = ({navigation}) => {
  const role: RoleType = ORG_ROLE;
  const [message, setMessage] = useState('');

  const dispatch = useDispatch();
  const [login] = useLoginMutation();

  const {values, errors, handleChange, setFieldValue, handleSubmit, resetForm} =
    useFormik({
      initialValues,
      validationSchema: loginValidationSchema,
      enableReinitialize: true,
      onSubmit: ({username, password, rememberMe}) => {
        handleSignIn(username, password, rememberMe);
      },
    });

  useEffect(() => {
    Orientation.lockToPortrait();

    return () => {
      Orientation.unlockAllOrientations();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      return () => {
        resetForm();
      };
    }, [resetForm]),
  );

  useEffect(() => {
    if (message === success) {
      navigation.navigate(SCREENS.HOME);
    }
  }, [message, navigation]);

  const handleSignIn = async (
    username = '',
    password = '',
    rememberMe = false,
  ) => {
    try {
      const {accessToken, expiresIn, tokenType} = await login({
        username,
        password,
        rememberMe,
        role,
      }).unwrap();

      asyncStorageSetToken({
        name: ROLE_TOKEN_MAP[role],
        tokenType,
        expires: expiresIn,
        token: accessToken,
      });

      dispatch(setAuthorized(true));
      setMessage(success);
    } catch (error: any) {
      setMessage(error.message);
    }
  };

  const handleRememberMeChange = () => {
    setFieldValue('rememberMe', !values.rememberMe);
  };
  const handleForgotPassword = () => {
    navigation.navigate(SCREENS.FORGOT_PASSWORD);
  };

  const handlePressSignIn = () => {
    handleSubmit();
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        <Text>{message}</Text>
        <Text h3 style={styles.title}>
          Login
        </Text>
        <Text style={styles.subtitle}>Log in with your email and password</Text>
        <Input
          placeholder="Email Address"
          value={values.username}
          onChangeText={handleChange('username')}
          errorMessage={errors.username}
        />
        <Input
          placeholder="Password"
          value={values.password}
          onChangeText={handleChange('password')}
          secureTextEntry
          errorMessage={errors.password}
        />
        <View style={styles.additionalActionContainer}>
          <CheckBox
            title="Remember me"
            checked={values.rememberMe}
            onPress={handleRememberMeChange}
          />
          <Button
            type="clear"
            title="Forgot password?"
            onPress={handleForgotPassword}
          />
        </View>
        <Button title="Sign In" onPress={handlePressSignIn} />
        <Text style={styles.or}>or continue with</Text>
        <View style={styles.socialIcons}>
          <IconButton
            iconName="linkedin"
            iconType="local"
            onPress={() => console.log('linkedin')}
          />
          <IconButton
            iconName="microsoft"
            iconType="local"
            onPress={() => console.log('windows')}
          />
          <IconButton
            iconName="facebook"
            iconType="local"
            onPress={() => console.log('facebook')}
          />
          <IconButton
            iconName="google"
            iconType="local"
            onPress={() => console.log('google')}
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  additionalActionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  or: {
    alignSelf: 'center',
    marginVertical: 20,
  },
  socialIcons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 24,
  },
});

export default SignInScreen;
