import * as Joi from "joi";

import { BaseValidator } from "@common/validators";

export const CreateProductValidator = BaseValidator.keys({
  name: Joi.string().trim().required(),
  description: Joi.string().trim().allow(null),
  price: Joi.number().required(),
  details: Joi.string().trim().required(),
  color: Joi.string().trim().allow(null),
  imageURL: Joi.string().trim().required(),
  quantity: Joi.number().required(),
  categoryId: Joi.string().trim().required(),
});
