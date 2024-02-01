import Joi from "joi";

const createTestimonialValidation = Joi.object({
    description: Joi.string().required(),
    rating: Joi.string().required(),
});

const updateTestimonialValidation = Joi.object({
    description: Joi.string().optional(),
    rating: Joi.string().optional(),
});

export {
    createTestimonialValidation,
    updateTestimonialValidation
};