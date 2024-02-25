import userController from "../controller/user-controller.js";
import { authentication, isAdmin } from "../middleware/auth-middleware.js";
import express from "express";
import menuController from "../controller/menu-controller.js";
import { uploadMenu, uploadUser } from "../middleware/upload-middleware.js";
import testimonialController from "../controller/testimonial-controller.js";
import cartController from "../controller/cart-controller.js";
import orderCotroller from "../controller/order-cotroller.js";

const router = express.Router();
// router.use(authentication);

// Menus Admin
router.get('/api/menus/', authentication, isAdmin, menuController.getMenus);
router.post('/api/menus/', authentication, isAdmin, uploadMenu.single('image'), menuController.createMenu);
router.delete('/api/menus/:menuId', authentication, isAdmin, menuController.deleteMenu);
router.get('/api/menus/:menuId', authentication, isAdmin, menuController.getMenu);
router.patch('/api/menus/:menuId', authentication, isAdmin, uploadMenu.single('image'), menuController.updateMenu);

// Users
router.get('/api/users/get-login', authentication, userController.getLogin);
router.get('/api/users/:userId', authentication, userController.getUser);
router.patch('/api/users/:userId', authentication, uploadUser.single('image'), userController.updateUser);
router.delete('/api/users/:userId', authentication, isAdmin, userController.deleteUser);
router.put('/api/users/changePassword', authentication, userController.changePassword);
router.put('/api/users/:userId', authentication, userController.activatedUser);
router.post('/api/users/logout', authentication, userController.logoutUser);
router.get('/api/users', authentication, isAdmin, userController.getUsers);
router.post('/api/users', authentication, isAdmin, userController.createUser);

// Auth
router.post('/api-public/users', userController.register);
router.get('/api-public/users/activate/:email/:userId', userController.setActivateUser);
router.post('/api-public/users/login', userController.login);
router.get('/api-public/users/refresh', userController.setRefreshToken);
router.post('/api-public/users/forgot-password', userController.forgotPassword);
router.get('/api-public/users/valid-token/:token', userController.validToken);
router.patch('/api-public/users/reset-password/:token', userController.resetPassword);


// order cart
router.get('/api/order', authentication, orderCotroller.getCheckout);
router.post('/api/order', authentication, orderCotroller.createOrder);
router.post('/api/midtransWebhook', orderCotroller.midtransWebhook);


// Carts
router.get('/api/carts', authentication, cartController.getCarts);
router.post('/api/carts', authentication, cartController.createCart);
router.get('/api/carts/count', authentication, cartController.countCart);
router.put('/api/carts/:cartId', authentication, cartController.updateCart);
router.get('/api/carts/:cartId', authentication, cartController.getCart);
router.delete('/api/carts/:cartId', authentication, cartController.deleteCart);

// Menus public
router.get('/api-public/menus', menuController.getMenus);
router.get('/api-public/cari-menu', menuController.cariMenu);

// Testimonial public
router.get('/api-public/testimonial', testimonialController.getTestimonials);

// Testimonials
router.get('/api/testimonial', authentication, testimonialController.getTestimonials);
router.post('/api/testimonial', authentication, testimonialController.createTestimonial);
router.get('/api/testimonial/:testimonialId', authentication, testimonialController.getTestimonial);
router.delete('/api/testimonial/:testimonialId', authentication, testimonialController.deleteTestimonial);
router.patch('/api/testimonial/:testimonialId', authentication, testimonialController.updateTestimonial);



export {
    router
};