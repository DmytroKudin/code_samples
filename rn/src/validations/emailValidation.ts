import * as Yup from 'yup';
import {
  emailField,
  requiredField,
} from '@validations/constants/validationMessages.ts';

export const emailValidation = Yup.object().shape({
  email: Yup.string().required(requiredField).email(emailField),
});
