import sequelize from "../utils/db.js";
import User from "../model/user-model.js";
import { ResponseError } from "../error/response-error.js";
import logger from "../middleware/logging-middleware.js";
import { sendMail, sendMailForgotPassword } from "../utils/sendMail.js";
import { Op } from "sequelize";
import { v4 as tokenForgot } from 'uuid';
import { compare } from "../utils/bcrypt.js";
import { generateAccessToken, generateRefreshToken, parseJWT, verifyRefreshToken } from "../utils/jwt.js";
import { changePasswordValidation, createUserValidation, forgotPasswordValidation, loginUserValidation, registerUserValidation, resetPasswordValidation, updateUserValidation } from "../validation/users-validation.js";
import { validate } from "../validation/validation.js";
import fs from "fs";

const register = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const users = await validate(registerUserValidation, req.body);
        const userExists = await User.findAll({
            where: {
                email: users.email,
            },
        });

        if (userExists[0] && userExists[0].isActive) {
            throw new ResponseError(400, false, ["Email already activated"], null);
        } else if (userExists[0] && !userExists[0].isActive && Date.parse(userExists[0].expireTime) > new Date()) {
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
            image: 'default.jpg',
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
                    phone: data.phone,
                    image: data.image,
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
        const data = await User.findAll({
            order: [['createdAt', 'ASC']]
        });

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

        if (!data) {
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

const getLogin = async (req, res, next) => {
    try {
        const email = req.user.email;

        const data = await User.findOne({ where: { email: email } });
        if (!data || data.isActive == 0) {
            throw new ResponseError(404, false, 'User not found', null);
        }

        res.status(200).json({
            status: true,
            statusResponse: 200,
            message: "OK",
            data: data
        });
    } catch (error) {
        logger.error(`Error in get login function: ${error.message}`);
        logger.error(error.stack);
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
                message: `User ${userActivate.name} Activated`,
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
            phone: userExists.phone,
            image: userExists.image,
            password: userExists.password,
            isAdmin: userExists.isAdmin
        };
        const token = generateAccessToken(usr);
        const refreshToken = generateRefreshToken(usr);
        usr.loginToken = token;
        await User.update(
            {
                loginToken: token
            },
            {
                where: {
                    email: userExists.email
                }
            }
        );
        return res.status(200).json({
            status: true,
            statusResponse: 200,
            message: "Login successfully",
            data: usr,
            // accessToken: token,
            // refreshToken: refreshToken

        });

    } catch (error) {
        logger.error(`Error in login function: ${error.message}`);
        logger.error(error.stack);
        next(error);
    }
};

const logoutUser = async (req, res, next) => {
    try {
        const email = req.user.email;
        await User.update(
            {
                loginToken: null
            },
            {
                where: {
                    email: email
                }
            }
        );
        return res.status(200).json({
            status: true,
            statusResponse: 200,
            message: "Logout successfully"
        });
    } catch (error) {
        logger.error(`Error in logout user function: ${error.message}`);
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

        if (req.file) {
            const filePath = `uploads/user/${user.image}`;
            if (user.image !== 'default.jpg') {
                fs.unlinkSync(filePath);
            }
        }

        if (req.file) {
            userUpdate.image = req.file.filename;
        }
        await User.update(
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
        res.status(200).json({
            status: true,
            statusResponse: 200,
            message: "user update successfully",
            data: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                isAdmin: updatedUser.isAdmin
            },
        });

        logger.info(`User ${updatedUser} updated successfuly`);
    } catch (error) {
        if (req.file) {
            const filePath = `uploads/user/${req.file.filename}`;
            fs.unlinkSync(filePath);
        }
        logger.error(`Error in update user function: ${error.message}`);
        logger.error(error.stack);
        next(error);
    }
};


const changePassword = async (req, res, next) => {
    try {
        const userLogin = req.user;
        const changePass = validate(changePasswordValidation, req.body);

        const isCurrentPasswordValid = compare(changePass.currentPassword, userLogin.password);
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


const forgotPassword = async (req, res, next) => {
    try {
        const user = validate(forgotPasswordValidation, req.body);
        const data = await User.findOne({
            where: {
                email: user.email,
            }
        });
        if (!data) {
            throw new ResponseError(404, false, "Email not registered", null);
        }

        const token = tokenForgot();
        const mailFogot = sendMailForgotPassword(data.name, data.email, token);
        if (!mailFogot) {
            throw new ResponseError(500, false, "Error in sending email", null);
        }
        await User.update(
            {
                forgotToken: token
            },
            {
                where: {
                    email: data.email
                }
            }
        );

        res.status(200).json({
            status: true,
            statusResponse: 200,
            message: "Check your email to reset password",
            data: null
        });
        logger.info("Check your email to reset password");

    } catch (error) {
        logger.error(`Error in forgot passwword function: ${error.message}`);
        logger.error(error.stack);
        next(error);
    }
};

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

        if (user.image && user.image !== 'default.jpg') {
            const userImagePath = `uploads/user/${user.image}`;
            fs.unlinkSync(userImagePath);
        }

        res.status(200).json({
            status: true,
            statusResponse: 200,
            message: "User delete successfully",
            data: null
        });
        logger.info("User delete successfully");
    } catch (error) {
        logger.error(`Eror in delete user function: ${error.message}`);
        logger.error(error.stack);
        next(error);
    }
};


const validToken = async (req, res, next) => {
    try {
        const token = req.params.token;
        const userExists = await User.findOne({
            where: {
                forgotToken: token
            }
        });
        if (!userExists) throw new ResponseError(404, false, 'Invalid Token', null);

        const currentTimestamp = new Date();
        const tokenTimestamp = new Date(userExists.updatedAt);
        // diubah ke menit karena dalam milidetik
        const timeDifference = (currentTimestamp - tokenTimestamp) / 60000;
        console.log(timeDifference);

        // token hanya berlaku di 30 menit
        if (timeDifference > 30) throw new ResponseError(404, false, "Expired Token", null);

        res.status(200).json({
            status: true,
            statusResponse: 200,
            message: "Token valid",
            data: null
        });
    } catch (error) {
        logger.error(`Eror in valid token function: ${error.message}`);
        logger.error(error.stack);
        next(error);
    }
};

const resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const userExists = await User.findOne({
            where: {
                forgotToken: token
            }
        });
        if (!userExists) {
            throw new ResponseError(404, false, 'Invalid Token or Expired', null);
        }
        console.log(req.body);
        const resetPasswordUser = validate(resetPasswordValidation, req.body);
        const resetpass = await User.update({ forgotToken: null, password: resetPasswordUser.newPassword }, { where: { forgotToken: token } });
        return res.status(200).json({
            status: true,
            statusResponse: 200,
            message: "Thank you for resetting your password!",
            data: resetpass
        });
    } catch (error) {
        logger.error(`Error in valid reset password function: ${error.message}`);
        logger.error(error.stack);
        next(error);
    }
};

const activatedUser = async (req, res, next) => {
    const { userId } = req.params;

    try {
        const user = await User.findByPk(userId);

        if (!user) throw new ResponseError(404, false, 'User not found', null);

        user.isActive = !user.isActive;

        await user.save();


        res.status(200).json({
            status: true,
            statusResponse: 200,
            message: "User activation status updated successfully",
            data: user.name
        });
        logger.info("User activation status updated successfully");
    } catch (error) {
        logger.error(`Error in Active User function: ${error.message}`);
        logger.error(error.stack);
        next(error);
    }
};

const createUser = async (req, res, next) => {
    try {
        const userCreate = validate(createUserValidation, req.body);
        const userExist = await User.findOne({
            where: {
                email: userCreate.email
            }
        });

        if (userExist) throw new ResponseError(400, false, 'Email sudah terdaftar', null);

        const result = await User.create({
            ...userCreate,
            password: 'Pizza21!',
            image: 'default.jpg'
        });

        res.status(201).json({
            status: true,
            statusResponse: 201,
            message: "Created account user successfully",
            data: result
        });
        logger.info(`create account ${userCreate.name} successfuly`);
    } catch (error) {
        logger.error(`Error in create user function: ${error.message}`);
        logger.error(error.stack);
        next(error);
    }
};

export default {
    register,
    getUsers,
    setActivateUser,
    login,
    logoutUser,
    setRefreshToken,
    updateUser,
    changePassword,
    forgotPassword,
    getUser,
    deleteUser,
    validToken,
    resetPassword,
    getLogin,
    activatedUser,
    createUser
};