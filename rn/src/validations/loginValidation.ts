import * as Yup from 'yup';
import {
  emailField,
  passwordFormat,
  requiredField,
} from '@validations/constants/validationMessages.ts';
import {passwordRegExp} from '@constants/regExp.ts';

export const loginValidationSchema = Yup.object().shape({
  username: Yup.string().required(requiredField).email(emailField),
  password: Yup.string()
    .required(requiredField)
    .matches(passwordRegExp, passwordFormat),
});
