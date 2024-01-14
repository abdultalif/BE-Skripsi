import userController from "../controller/user-controller.js";
import { authentication } from "../middleware/auth-middleware.js";
import express from "express";

const router = express.Router();
router.use(authentication);

router.get('/api/users/:userId', userController.getUser);
router.patch('/api/users/:userId', userController.updateUser);
router.delete('/api/users/:userId', userController.deleteUser);
router.put('/api/users/changePassword', userController.changePassword);

export {
    router
}