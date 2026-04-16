import * as authErrors from './auth.errors.json';
import * as otpErrors from './otp.errors.json';
import * as passwordErrors from './password.errors.json';
import * as userErrors from './user.errors.json';
import * as validationErrors from './validation.errors.json';
import * as emailErrors from './email.errors.json';

export const customErrors = {
  ...authErrors,
  ...otpErrors,
  ...passwordErrors,
  ...userErrors,
  ...validationErrors,
  ...emailErrors,
};
