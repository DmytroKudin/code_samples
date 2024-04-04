import {
  Keyboard,
  Linking,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {Divider, Text} from '@rneui/themed';
import {useFormik} from 'formik';
import Input from '@components/Input';
import Button from '@components/Button';
import {useState} from 'react';
import {emailValidation} from '@validations/emailValidation.ts';
import {useRecoveryMutation} from '@api/authApi.js';

const tel = '+123456789';
const supportEmail = 'support@example.com';

const ForgotPasswordScreen = ({role = 'org'}: any) => {
  const [message, setMessage] = useState('');

  const [recovery] = useRecoveryMutation();

  const handleSubmitForm = async ({email}: any) => {
    try {
      const {data} = await recovery({role, email}).unwrap();
      setMessage(data.message);
    } catch (error: any) {
      setMessage(error.message);
    }
  };

  const {values, handleChange, errors, handleSubmit} = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: emailValidation,
    enableReinitialize: true,
    onSubmit: handleSubmitForm,
  });

  const handleResetLink = () => {
    handleSubmit();
  };

  const handlePhonePress = () => {
    Linking.openURL(`tel:${tel}`);
  };

  const handleEmailPress = () => {
    Linking.openURL(`mailto:${supportEmail}`);
  };
  console.log('errors.email', errors.email);
  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.contentContainer}>
            <Text>{message}</Text>
            <Text h3 style={styles.title}>
              Forgot password?
            </Text>
            <Text style={styles.subtitle}>
              Enter your email address below and we’will get you back on track
            </Text>
            <Input
              placeholder="Email Address"
              value={values.email}
              onChangeText={handleChange('email')}
              errorMessage={errors.email}
            />
            <Button title="Request reset link" onPress={handleResetLink} />
          </View>
          <View style={styles.bottomBlock}>
            <Divider style={styles.divider} />
            <Text>
              If you have any e-Learning queries, please feel free to contact
              the e-Learning team on
              <Text onPress={handlePhonePress} style={styles.linkText}>
                {` ${tel} `}
              </Text>
              or alternatively email us on
              <Text onPress={handleEmailPress} style={styles.linkText}>
                {` ${supportEmail}`}
              </Text>
            </Text>
          </View>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 800,
    height: '100%',
    maxHeight: '100%',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    alignSelf: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 50,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
  },
  bottomBlock: {
    paddingVertical: 50,
  },
  divider: {
    marginBottom: 15,
  },
  linkText: {
    color: 'blue',
  },
});

export default ForgotPasswordScreen;
