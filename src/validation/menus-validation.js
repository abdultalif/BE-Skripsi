import Joi from "joi";

const createMenuValidation = Joi.object({
    name: Joi.string().max(100).required(),
    description: Joi.string().optional(),
    price: Joi.number().required(),
    stok: Joi.number().required(),
    image: Joi.required(),
    category: Joi.string().max(100).required(),
});

const updateMenuValidation = Joi.object({
    name: Joi.string().max(100),
    description: Joi.string().optional(),
    price: Joi.number(),
    stok: Joi.number(),
    image: Joi.optional(),
    category: Joi.string().max(100),
}).min(1);


export {
    createMenuValidation,
    updateMenuValidation
};