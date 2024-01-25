import Joi from "joi";

const createTestimonialValidation = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.required(),
    rating: Joi.string().required(),
});

const updateTestimonialValidation = Joi.object({
    name: Joi.string().optional(),
    description: Joi.string().optional(),
    image: Joi.optional(),
    rating: Joi.string().optional(),
});

export {
    createTestimonialValidation,
    updateTestimonialValidation
};