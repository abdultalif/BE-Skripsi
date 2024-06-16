import userController from "../controller/user-controller.js";
import { authentication, isAdmin } from "../middleware/auth-middleware.js";
import express from "express";
import menuController from "../controller/menu-controller.js";
import { uploadMenu, uploadUser } from "../middleware/upload-middleware.js";
import cartController from "../controller/cart-controller.js";
import orderCotroller from "../controller/order-cotroller.js";
import ongkirController from "../controller/ongkir-controller.js";
import reviewController from "../controller/review-controller.js";

const router = express.Router();
// router.use(authentication);

// Menus Admin
router.get('/api/menus/', authentication, isAdmin, menuController.getMenus);
router.post('/api/menus/', authentication, isAdmin, uploadMenu.single('image'), menuController.createMenu);
router.delete('/api/menus/:menuId', authentication, isAdmin, menuController.deleteMenu);
router.get('/api/menus/:menuId', authentication, isAdmin, menuController.getMenu);
router.patch('/api/menus/:menuId', authentication, isAdmin, uploadMenu.single('image'), menuController.updateMenu);

// Users
router.get('/api/user-count', authentication, isAdmin, userController.getUserCount);
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


// order
router.get('/api/order/:orderId', authentication, orderCotroller.getCheckout);
router.get('/api/orderfilters', authentication, isAdmin, orderCotroller.getFilterCheckouts);
router.post('/api/cancel-transaction', authentication, orderCotroller.cancelTransaction);
router.get('/api/orderfilter', authentication, orderCotroller.getFilterCheckoutById);
router.post('/api/order', authentication, orderCotroller.createOrder);
router.post('/api/midtransWebhook', orderCotroller.midtransWebhook);
router.put('/api/status-ongkir/:orderId', authentication, orderCotroller.updateStatusOngkir);
router.put('/api/resi/:orderId', authentication, orderCotroller.resiUpdate);

// Laporan Admin
router.get('/api/daily', authentication, isAdmin, orderCotroller.daily);
router.get('/api/weekly', authentication, isAdmin, orderCotroller.weekly);
router.get('/api/monthly', authentication, isAdmin, orderCotroller.monthly);
router.get('/api/yearly', authentication, isAdmin, orderCotroller.yearly);
router.get('/api/yesterday', authentication, isAdmin, orderCotroller.yesterday);


// Dashboard
router.get('/api/orderLimit5', authentication, isAdmin, orderCotroller.getCheckoutsLimit5);
router.get('/api/order-status', authentication, isAdmin, orderCotroller.orderStatus);
router.get('/api/total-quantity', authentication, isAdmin, orderCotroller.getTotalQuantity);
router.get('/api/total-price', authentication, isAdmin, orderCotroller.getTotalPrice);
router.get('/api/order-count', authentication, isAdmin, orderCotroller.getOrdersCount);


// Reviews
router.post('/api/reviews', authentication, reviewController.createReview);
router.get('/api/reviews/:orderId/:menuId', authentication, reviewController.getReviews);


// Carts
router.get('/api/carts', authentication, cartController.getCarts);
router.post('/api/carts', authentication, cartController.createCart);
router.get('/api/carts/count', authentication, cartController.countCart);
router.put('/api/carts/:cartId', authentication, cartController.updateCart);
router.get('/api/carts/:cartId', authentication, cartController.getCart);
router.delete('/api/carts/:cartId', authentication, cartController.deleteCart);

// Menus public
router.get('/api-public/cari-menu', menuController.cariMenu);
router.get('/api-public/menus', menuController.products);
router.get('/api-public/reviews/:menuId', reviewController.getReview);



// Raja Ongkir
router.get('/api/provinsi', ongkirController.province);
router.get('/api/city/:provinceId', ongkirController.city);
router.post('/api/ongkir', authentication, ongkirController.ongkir);



export {
    router
};