import Joi from "joi";

const createCartValidation = Joi.object({
    quantity: Joi.number().required(),
    total: Joi.number().required(),
    menuId: Joi.string().required()
});

const updateCartValidation = Joi.object({
    quantity: Joi.number().optional(),
    total: Joi.number().optional(),
});

export {
    createCartValidation,
    updateCartValidation
};