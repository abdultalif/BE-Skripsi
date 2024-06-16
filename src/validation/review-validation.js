import Joi from "joi";

const createReviewValidation = Joi.object({
    rating: Joi.string().required(),
    review: Joi.string().required(),
    menuId: Joi.string().required(),
    orderId: Joi.string().required()
});


export {
    createReviewValidation,
};