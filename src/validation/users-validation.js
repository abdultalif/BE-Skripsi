import Joi from "joi";

const registerUserValidation = Joi.object({
    email: Joi.string().max(100).required().email(),
    password: Joi.string().min(8).max(100).required(),
    confirmPassword: Joi.string().min(8).valid(Joi.ref('password')).required().strict(),
    name: Joi.string().max(100).required(),
});

const loginUserValidation = Joi.object({
    email: Joi.string().max(100).required().email(),
    password: Joi.string().max(100).required()
});

const updateUserValidation = Joi.object({
    email: Joi.string().max(100).email(),
    name: Joi.string().max(100),
}).min(1);

// const forgotPasswordValidation = Joi.object({
//     email: Joi.string().email().required().max(100),
// });

const changePasswordValidation = Joi.object({
    curentPassword: Joi.string().required().min(8),
    newPassword: Joi.string().min(8).max(100).required(),
    confirmPassword: Joi.string().min(8).valid(Joi.ref('newPassword')).required().strict(),
});

export {
    registerUserValidation,
    loginUserValidation,
    updateUserValidation,
    // forgotPasswordValidation,
    changePasswordValidation
};