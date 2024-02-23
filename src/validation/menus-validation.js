import Joi from "joi";

const createMenuValidation = Joi.object({
    name: Joi.string().max(100).required(),
    description: Joi.string().optional(),
    price: Joi.number().required(),
    image: Joi.required(),
    category: Joi.string().max(100).required(),
});

const updateMenuValidation = Joi.object({
    name: Joi.string().max(100),
    description: Joi.string().optional(),
    price: Joi.number(),
    image: Joi.optional(),
    category: Joi.string().max(100),
});


export {
    createMenuValidation,
    updateMenuValidation
};