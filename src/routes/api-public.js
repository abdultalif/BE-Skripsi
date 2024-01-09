import express from "express";
import userController from "../controller/user-controller.js";
import { ResponseError } from "../error/response-error.js";

const publicRouter = express.Router();

publicRouter.post('/api-public/users', userController.register);
publicRouter.get('/api-public/users', userController.getUser);
publicRouter.get('/api-public/users/activate/:email/:userId', userController.setActivateUser);

publicRouter.use('*', (req, res) => {
    throw new ResponseError(404, "Not Found");
})


export { publicRouter };