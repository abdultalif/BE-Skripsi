import Joi from "joi";

const registerUserValidation = Joi.object({
    email: Joi.string().max(100).required().email(),
    password: Joi.string().min(8).max(100).required(),
    confirmPassword: Joi.string().min(8).valid(Joi.ref('password')).required().strict(),
    name: Joi.string().max(100).required(),
    phone: Joi.string().required().max(13).min(11),
});

const loginUserValidation = Joi.object({
    email: Joi.string().max(100).required().email(),
    password: Joi.string().max(100).required(),
});

const updateUserValidation = Joi.object({
    email: Joi.string().max(100).email(),
    name: Joi.string().max(100),
    phone: Joi.string().max(13).min(11),
});

const forgotPasswordValidation = Joi.object({
    email: Joi.string().email().required()
});

const changePasswordValidation = Joi.object({
    currentPassword: Joi.string().required().min(8),
    newPassword: Joi.string().min(8).max(100).required(),
    confirmPassword: Joi.string().required().min(8).valid(Joi.ref('newPassword')).strict(),
});

const resetPasswordValidation = Joi.object({
    newPassword: Joi.string().min(8).max(100).required(),
    confirmPassword: Joi.string().min(8).valid(Joi.ref('newPassword')).required().strict(),
});

const createUserValidation = Joi.object({
    email: Joi.string().max(50).required().email().messages({
        'string.base': 'Email harus berupa teks',
        'string.email': 'Format email tidak valid',
        'string.max': 'Email tidak boleh lebih dari 100 karakter',
        'any.required': 'Email wajib diisi'
    }),

    name: Joi.string().max(30).required(),


    phone: Joi.number().required().min(11).messages({
        'number.base': 'Nomor telepon harus berupa angka',
        'number.min': 'Nomor telepon minimal {#limit} karakter',
        'number.max': 'Nomor telepon tidak boleh lebih dari {#limit} karakter',
        'any.required': 'Nomor telepon wajib diisi'
    }),
    isAdmin: Joi.boolean().required()
});

export {
    registerUserValidation,
    loginUserValidation,
    updateUserValidation,
    forgotPasswordValidation,
    changePasswordValidation,
    resetPasswordValidation,
    createUserValidation
};