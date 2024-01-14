import express from "express";
import userController from "../controller/user-controller.js";
import { ResponseError } from "../error/response-error.js";

const publicRouter = express.Router();

publicRouter.post('/api-public/users', userController.register);
publicRouter.get('/api-public/users', userController.getUsers);
publicRouter.get('/api-public/users/activate/:email/:userId', userController.setActivateUser);
publicRouter.post('/api-public/users/login', userController.login);
publicRouter.get('/api-public/users/refresh', userController.setRefreshToken);
// publicRouter.post('/api-public/users/forgot-password/', userController.forgotPassword);

export { publicRouter };