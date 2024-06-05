import * as Joi from "joi";

import { BaseValidator } from "@common/validators";

export const UpdateProductValidator = BaseValidator.keys({
    name: Joi.string().trim().allow(null),
    description: Joi.string().trim().allow(null),
    price: Joi.number().allow(null),
    details: Joi.string().trim().allow(null),
    color: Joi.string().trim().allow(null),
    imageURL: Joi.string().trim().allow(null),
    categoryId: Joi.string().trim().allow(null)
})