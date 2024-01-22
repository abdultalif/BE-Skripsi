import express from "express";
import userController from "../controller/user-controller.js";
import { ResponseError } from "../error/response-error.js";
import menuController from "../controller/menu-controller.js";

const publicRouter = express.Router();

publicRouter.post('/api-public/users', userController.register);
publicRouter.get('/api-public/users', userController.getUsers);
publicRouter.get('/api-public/users/activate/:email/:userId', userController.setActivateUser);
publicRouter.post('/api-public/users/login', userController.login);
publicRouter.get('/api-public/users/refresh', userController.setRefreshToken);
publicRouter.post('/api-public/users/forgot-password/', userController.forgotPassword);
publicRouter.get('/api-public/users/valid-token/:token', userController.validToken);
publicRouter.patch('/api-public/users/reset-password/:token', userController.resetPassword);

publicRouter.get('/api-public/menus', menuController.getMenus);
export { publicRouter };