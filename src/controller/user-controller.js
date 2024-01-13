import sequelize from "../utils/db.js"
import user from "../model/user-model.js"
import { ResponseError } from "../error/response-error.js";
import logger from "../middleware/logging-middleware.js";
import { registerValidation } from "../validation/user-validation.js";
import { sendMail } from "../utils/sendMail.js";
import { Op } from "sequelize";
import { compare } from "../utils/bcrypt.js";
import { generateAccessToken, generateRefreshToken, parseJWT, verifyRefreshToken } from "../utils/jwt.js";

const register = async (req, res, next) => {
    const t = await sequelize.transaction();
    const validation = {
        name: "required",
        email: "required,isEmail",
        password: "required,isStrongPassword",
        confirmPassword: "required",
    }

    try {

        const users = await registerValidation(validation, req.body);
        if (users.data.password !== users.data.confirmPassword) {
            users.message.push("Password does not match");
            // throw new ResponseError(400, "error", users.message, "Register Field", null)
        }
        if (users.message.length > 0) {
            throw new ResponseError(400, "error", users.message, "Register Field", null)
        }
        const userExists = await user.findAll({
            where: {
                email: users.data.email,
            },
        });

        if (userExists.length > 0 && userExists[0].isActive) {
            throw new ResponseError(400, "error", ["Email already activated"], "Register Field", null);
        } else if (userExists.length > 0 && !userExists[0].isActive && Date.parse(userExists[0].expireTime) > new Date()) {
            throw new ResponseError(400, "error", ["Email already registered, please check your email"], "Register Field", null);
        } else {
            user.destroy({
                where: {
                    email: users.data.email
                }
            },
                {
                    transaction: t
                });
        }

        const data = await user.create({
            ...users.data,
            expireTime: new Date()
        },
            {
                transaction: t
            });

        const result = await sendMail(data.name, data.email, data.id)
        console.log(data.id);
        if (!result) {

            await t.rollback();
            throw new ResponseError(500, "Error", "Resgister Failed")

        } else {

            await t.commit();
            res.status(201).json({
                statusResponse: 201,
                status: "success",
                success: "Register Success",
                message: "User created, please check your email",
                data: {
                    id: data.id,
                    name: data.name,
                    email: data.email,
                    expireTime: data.expireTime
                },
            });

        }

    } catch (error) {
        t.rollback()
        logger.error(`Error in register function: ${error.message}`);
        logger.error(error.stack);
        next(error);
    }
}

const getUser = async (req, res, next) => {
    try {
        const data = await user.findAll();

        if (data.length === 0) {
            throw new ResponseError(404, 'error', 'User is not found', null, null);
        }

        res.status(200).json({
            statusResponse: 200,
            status: "success",
            message: "OK",
            data
        })
    } catch (error) {
        next(error)
    }
}


const setActivateUser = async (req, res, next) => {
    try {
        const { email, userId } = req.params;
        const userActivate = await user.findOne({
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
            throw new ResponseError(404, 'error', 'User not found or expired', 'Activate User Field', null);
        } else {
            userActivate.isActive = true;
            userActivate.expireTime = null;
            await userActivate.save();
            res.status(200).json({
                statusResponse: 200,
                status: "success",
                message: "User Activated",
                data: {
                    name: userActivate.name,
                    email: userActivate.email,
                }
            })
        }
    } catch (error) {
        logger.error(`Error in setActivateUser function: ${error.message}`);
        logger.error(error.stack);
        next(error);
    }
}


const login = async (req, res, next) => {
    try {
        const valid = {
            email: "required,isEmail",
            password: "required",
        }
        const userLogin = await registerValidation(valid, req.body);
        const data = userLogin.data;

        if (userLogin.message.length > 0) {
            throw new ResponseError(400, 'error', userLogin.message, 'Login Field', null);
        }
        const userExists = await user.findOne({
            where: {
                email: data.email,
                isActive: true
            }
        });
        if (!userExists) {
            throw new ResponseError(401, 'error', 'Email or password wrong', 'Login Field', null)
        }

        const isPasswordValid = compare(data.password, userExists.password);
        if (!isPasswordValid) {
            throw new ResponseError(401, 'error', 'Email or password wrong', 'Login Field', null)
        }

        const usr = {
            id: userExists.id,
            name: userExists.name,
            email: userExists.email,
        }
        const token = generateAccessToken(usr);
        const refreshToken = generateRefreshToken(usr);
        return res.status(200).json({
            statusResponse: 200,
            status: "success",
            message: "Login successfully",
            data:
                usr,
            accessToken: token,
            refreshToken: refreshToken

        })

    } catch (error) {
        logger.error(`Error in login function: ${error.message}`);
        logger.error(error.stack);
        next(error);
    }
}

const setRefreshToken = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        // const [bearer, token] = authHeader.split(' ');
        const token = authHeader && authHeader.split(" ")[1];
        if (!token) {
            throw new ResponseError(401, "error", "Refresh token not found", "Refresh Field", null);
        }

        const verify = verifyRefreshToken(token)
        if (!verify) {
            throw new ResponseError(401, "error", "Invalid refresh token", "Refresh Field", null);
        }
        let data = parseJWT(token);
        console.log(data);
        const userLogin = await user.findOne({
            where: {
                email: data.email
            }
        });
        if (!userLogin) {
            throw new ResponseError(401, "erorr", "User not found", "Refresh failed", null);
        } else {
            const usr = {
                id: userLogin.id,
                name: userLogin.name,
                email: userLogin.email,
            }
            const token = generateAccessToken(usr);
            const refreshToken = generateRefreshToken(usr);
            return res.status(200).json({
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
}

export default {
    register,
    getUser,
    setActivateUser,
    login,
    setRefreshToken
}