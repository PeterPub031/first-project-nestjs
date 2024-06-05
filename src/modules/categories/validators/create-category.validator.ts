import * as Joi from "joi";

import { BaseValidator } from "@common/validators";

export const CreateCategoryValidator = BaseValidator.keys({
    name: Joi.string().trim().required(),
    parentId: Joi.string().trim().allow(null),
    // level: Joi.number().min(0).max(2),
})