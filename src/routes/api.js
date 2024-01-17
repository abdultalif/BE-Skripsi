import userController from "../controller/user-controller.js";
// import contactController from "../controller/contact-controller.js";
import { authentication } from "../middleware/auth-middleware.js";
import express from "express";
import menuController from "../controller/menu-controller.js";
import { uploadMenu } from "../middleware/upload-middleware.js";

const router = express.Router();
router.use(authentication);

router.get('/api/users/:userId', userController.getUser);
router.patch('/api/users/:userId', userController.updateUser);
router.delete('/api/users/:userId', userController.deleteUser);
router.put('/api/users/changePassword', userController.changePassword);


// router.post('/api/contacts/', contactController.createContact);

router.get('/api/menus/', menuController.getMenus);
router.post('/api/menus/', uploadMenu.single('image'), menuController.createMenu);
router.get('/api/menus/:menuId', menuController.getMenu);

export {
    router
};