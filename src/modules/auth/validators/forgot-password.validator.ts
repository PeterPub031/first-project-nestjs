import * as Joi from 'joi';

import { BaseValidator } from '@common/validators';

export const ForgotPasswordValidator = BaseValidator.keys({
  email: Joi.string().email().trim().required(),
});
