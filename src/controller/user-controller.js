import sequelize from "../utils/db.js";
import User from "../model/user-model.js";
import { ResponseError } from "../error/response-error.js";
import logger from "../middleware/logging-middleware.js";
import { sendMail } from "../utils/sendMail.js";
import { Op } from "sequelize";
import { compare } from "../utils/bcrypt.js";
import { generateAccessToken, generateRefreshToken, parseJWT, verifyRefreshToken } from "../utils/jwt.js";
import { changePasswordValidation, loginUserValidation, registerUserValidation, updateUserValidation } from "../validation/users-validation.js";
import { validate } from "../validation/validation.js";

const register = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const users = await validate(registerUserValidation, req.body);
        const userExists = await User.findAll({
            where: {
                email: users.email,
            },
        });

        if (userExists[0].isActive) {
            throw new ResponseError(400, false, ["Email already activated"], null);
        } else if (!userExists[0].isActive && Date.parse(userExists[0].expireTime) > new Date()) {
            throw new ResponseError(400, false, ["Email already registered, please check your email"], null);
        } else {
            User.destroy({
                where: {
                    email: users.email
                }
            },
                {
                    transaction: t
                });
        }

        const data = await User.create({
            ...users,
            expireTime: new Date()
        },
            {
                transaction: t
            });

        const result = await sendMail(data.name, data.email, data.id);
        console.log(data.id);
        if (!result) {

            await t.rollback();
            throw new ResponseError(500, false, "Resgister Failed", null);

        } else {

            await t.commit();
            res.status(201).json({
                status: true,
                statusResponse: 201,
                message: "User created, please check your email",
                data: {
                    id: data.id,
                    name: data.name,
                    email: data.email,
                    expireTime: data.expireTime
                },
            });
            logger.info(`User registered successfully: ${data.email}`);
        }

    } catch (error) {
        t.rollback();
        logger.error(`Error in register function: ${error.message}`);
        logger.error(error.stack);
        next(error);
    }
};

const getUsers = async (req, res, next) => {
    try {
        const data = await User.findAll();

        if (data.length === 0) {
            throw new ResponseError(404, false, 'User is not found', null);
        }

        res.status(200).json({
            status: true,
            statusResponse: 200,
            message: "OK",
            data
        });
    } catch (error) {
        next(error);
    }
};

const getUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const data = await User.findOne({
            where: {
                id: userId
            }
        });

        if (!data || data.isActive == 0) {
            throw new ResponseError(404, false, 'User is not found', null);
        }

        res.status(200).json({
            status: true,
            statusResponse: 200,
            message: "OK",
            data
        });
    } catch (error) {
        next(error);
    }
};


const setActivateUser = async (req, res, next) => {
    try {
        const { email, userId } = req.params;
        const userActivate = await User.findOne({
            where: {
                email: email,
                id: userId,
                isActive: false,
                expireTime: {
                    [Op.gte]: new Date(),
                }
            }
        });

        if (!userActivate) {
            throw new ResponseError(404, false, 'User not found or expired', null);
        } else {
            userActivate.isActive = true;
            userActivate.expireTime = null;
            await userActivate.save();
            res.status(200).json({
                status: true,
                statusResponse: 200,
                message: "User Activated",
                data: {
                    name: userActivate.name,
                    email: userActivate.email,
                }
            });
        }
    } catch (error) {
        logger.error(`Error in setActivateUser function: ${error.message}`);
        logger.error(error.stack);
        next(error);
    }
};


const login = async (req, res, next) => {
    try {
        const userLogin = await validate(loginUserValidation, req.body);

        const userExists = await User.findOne({
            where: {
                email: userLogin.email,
                isActive: true
            }
        });
        if (!userExists) {
            throw new ResponseError(401, false, 'Email or password wrong', null);
        }

        const isPasswordValid = compare(userLogin.password, userExists.password);
        if (!isPasswordValid) {
            throw new ResponseError(401, false, 'Email or password wrong', null);
        }

        const usr = {
            id: userExists.id,
            name: userExists.name,
            email: userExists.email,
            password: userExists.password,
        };
        const token = generateAccessToken(usr);
        const refreshToken = generateRefreshToken(usr);
        return res.status(200).json({
            status: true,
            statusResponse: 200,
            message: "Login successfully",
            data: usr,
            accessToken: token,
            refreshToken: refreshToken

        });

    } catch (error) {
        logger.error(`Error in login function: ${error.message}`);
        logger.error(error.stack);
        next(error);
    }
};

const setRefreshToken = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        // const [bearer, token] = authHeader.split(' ');
        const token = authHeader && authHeader.split(" ")[1];
        if (!token) {
            throw new ResponseError(401, false, "Refresh token not found", null);
        }

        const verify = verifyRefreshToken(token);
        if (!verify) {
            throw new ResponseError(401, false, "Invalid refresh token", null);
        }
        const data = parseJWT(token);
        console.log(data);
        const userLogin = await User.findOne({
            where: {
                email: data.email
            }
        });
        if (!userLogin) {
            throw new ResponseError(401, false, "User not found", null);
        } else {
            const usr = {
                id: userLogin.id,
                name: userLogin.name,
                email: userLogin.email,
            };
            const token = generateAccessToken(usr);
            const refreshToken = generateRefreshToken(usr);
            return res.status(200).json({
                status: true,
                statusResponse: 200,
                data: usr,
                accessToken: token,
                refreshToken: refreshToken
            });
        }
    } catch (error) {
        logger.error(`Error in refresh token function: ${error.message}`);
        logger.error(error.stack);
        next(error);
    }
};

const updateUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const user = await User.findOne({
            where: {
                id: userId
            }
        });

        if (!user) {
            throw new ResponseError(404, false, "User is not found", null);
        }

        const userUpdate = validate(updateUserValidation, req.body);
        const result = await User.update(
            {
                ...userUpdate
            },
            {
                where: {
                    id: userId
                }
            }
        );
        const updatedUser = await User.findOne({
            where: {
                id: userId
            }
        });
        return res.status(200).json({
            status: true,
            statusResponse: 200,
            message: "user update successfully",
            data: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
            },
        });
    } catch (error) {
        logger.error(`Error in update user function: ${error.message}`);
        logger.error(error.stack);
        next(error);
    }
};


const changePassword = async (req, res, next) => {
    try {
        const userLogin = req.user;
        const changePass = validate(changePasswordValidation, req.body);

        const isCurrentPasswordValid = compare(changePass.curentPassword, userLogin.password);
        if (!isCurrentPasswordValid) {
            throw new ResponseError(400, false, "Current password is incorrect", null);
        }
        await User.update(
            {
                password: changePass.newPassword,
            },
            {
                where: {
                    id: userLogin.id
                }
            }
        );
        return res.status(200).json({
            status: true,
            statusResponse: 200,
            message: "Change password successfully",
            data: null
        });

    } catch (error) {
        logger.error(`Error in change password fuction: ${error.message}`);
        logger.error(error.stack);
        next(error);
    }
};


// const forgotPassword = async (req, res, next) => {
// try {
//     const user = validate(forgotPasswordValidation, req.body);
//     const data = await User.findOne({
//         where: {
//             email: user.email,
//         }
//     });
//     if (!data) {
//         throw new ResponseError(404, false, "User is not found", null);
//     }




// } catch (error) {
//     logger.error(`Error in forgot passwword function: ${error.message}`);
//     logger.error(error.stack);
//     next(error)
// }
// }

const deleteUser = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const user = await User.findOne({
            where: {
                id: userId
            }
        });
        // console.log(userId);
        if (!user || user.isActive == 0) {
            throw new ResponseError(404, false, "User is not found", null);
        }

        await User.destroy({
            where: {
                id: userId
            }
        });
        return res.status(200).json({
            status: true,
            statusResponse: 200,
            message: "User delete successfully",
            data: null
        });
    } catch (error) {
        logger.error(`Eror in delete user function: ${error.message}`);
        logger.error(error.stack);
        next(error);
    }
};


export default {
    register,
    getUsers,
    setActivateUser,
    login,
    setRefreshToken,
    updateUser,
    changePassword,
    // forgotPassword,
    getUser,
    deleteUser
};