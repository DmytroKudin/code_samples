import AsyncStorage from '@react-native-async-storage/async-storage';
import {EXPIRES_IN, ORG_TOKEN} from '@constants/api.ts';
import {calculateExpires} from '@utils/date.ts';

export const asyncStorageSetToken = async ({
  name = '',
  tokenType = 'Bearer',
  token = '',
  expires = 0,
}) => {
  try {
    await AsyncStorage.setItem(name, `${tokenType} ${token}`);
    const expiresIn = calculateExpires(expires);
    await AsyncStorage.setItem(EXPIRES_IN, expiresIn.toString());
  } catch (error) {
    console.error('Error saving data', error);
  }
};

export const checkAuth = async (key = ORG_TOKEN) => {
  try {
    const token = await AsyncStorage.getItem(key);
    return !!token;
  } catch (error) {
    console.error('Error checking auth status:', error);
    return false;
  }
};

export const clearStorage = async () => {
  try {
    await AsyncStorage.clear();
    console.log('Storage successfully cleared!');
  } catch (error) {
    console.error('Failed to clear the async storage.');
  }
};
