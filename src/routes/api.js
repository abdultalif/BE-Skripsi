import userController from "../controller/user-controller.js";
import { authentication, isAdmin } from "../middleware/auth-middleware.js";
import express from "express";
import menuController from "../controller/menu-controller.js";
import { uploadMenu, uploadTestimonial } from "../middleware/upload-middleware.js";
import testimonialController from "../controller/testimonial-controller.js";

const router = express.Router();
// router.use(authentication);

// Users
router.get('/api/users/get-login', authentication, userController.getLogin);
router.get('/api/users/:userId', authentication, userController.getUser);
router.patch('/api/users/:userId', authentication, userController.updateUser);
router.delete('/api/users/:userId', authentication, userController.deleteUser);
router.put('/api/users/changePassword', authentication, userController.changePassword);
router.post('/api/users/logout', authentication, userController.logoutUser);

// Menus Admin
router.get('/api/menus/', authentication, isAdmin, menuController.getMenus);
router.post('/api/menus/', authentication, uploadMenu.single('image'), menuController.createMenu);
router.delete('/api/menus/:menuId', authentication, menuController.deleteMenu);
router.get('/api/menus/:menuId', authentication, menuController.getMenu);
router.put('/api/menus/:menuId', authentication, uploadMenu.single('image'), menuController.updateMenu);

// Auth
router.post('/api-public/users', userController.register);
router.get('/api-public/users', userController.getUsers);
router.get('/api-public/users/activate/:email/:userId', userController.setActivateUser);
router.post('/api-public/users/login', userController.login);
router.get('/api-public/users/refresh', userController.setRefreshToken);
router.post('/api-public/users/forgot-password', userController.forgotPassword);
router.get('/api-public/users/valid-token/:token', userController.validToken);
router.patch('/api-public/users/reset-password/:token', userController.resetPassword);


// Menus
router.get('/api-public/menus', menuController.getMenus);



// Testimonials
router.get('/api/testimonial', testimonialController.getTestimonials);
router.post('/api/testimonial', uploadTestimonial.single('image'), testimonialController.createTestimonial);
router.get('/api/testimonial/:testimonialId', testimonialController.getTestimonial);
router.delete('/api/testimonial/:testimonialId', testimonialController.deleteTestimonial);
router.patch('/api/testimonial/:testimonialId', uploadTestimonial.single('image'), testimonialController.updateTestimonial);


export {
    router
};