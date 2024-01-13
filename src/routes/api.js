import userController from "../controller/user-controller.js";
import { authentication } from "../middleware/auth-middleware.js";
import express from "express";

const router = express.Router();
router.use(authentication);

router.patch('/api/users/:userId', userController.updateUser);

export {
    router
}