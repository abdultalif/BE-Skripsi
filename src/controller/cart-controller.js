import { ResponseError } from "../error/response-error.js";
import logger from "../middleware/logging-middleware.js";
import Cart from "../model/cart-model.js";
import Menu from "../model/menu-model.js";
import User from "../model/user-model.js";
import { createCartValidation } from "../validation/carts-validation.js";
import { validate } from "../validation/validation.js";

const getCarts = async (req, res, next) => {
    try {
        const carts = await Cart.findAll({
            order: [['createdAt', 'ASC']],
            include: [
                {
                    model: User,
                    attributes: ['name']
                },
                {
                    model: Menu,
                    attributes: ['name', 'price', 'image']
                },
            ],
            attributes: ['id', 'quantity', 'total', 'createdAt', 'updatedAt']
        });
        if (carts.length === 0) throw new ResponseError(404, false, "Cart is not found", null);
        res.status(200).json({
            status: true,
            statusResponse: 200,
            message: "OK",
            data: carts
        });
        logger.info(`Get carts successfully`);
    } catch (error) {
        logger.error(`Error in get carts function ${error.message}`);
        logger.error(error.stack);
        next(error);
    }
};

const getCart = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({
            where: { id: req.params.cartId },
            include: [
                {
                    model: User,
                    attributes: ['name']
                },
                {
                    model: Menu,
                    attributes: ['name', 'price', 'image']
                },
            ],
            attributes: ['id', 'quantity', 'total', 'createdAt', 'updatedAt']
        });
        if (!cart) throw new ResponseError(404, false, "Cart is not found", null);
        res.status(200).json({
            status: true,
            statusResponse: 200,
            message: "OK",
            data: cart
        });
        logger.info(`Get cart successfully`);
    } catch (error) {
        logger.error(`Error in get cart function ${error.message}`);
        logger.error(error.stack);
        next(error);
    }
};

const createCart = async (req, res, next) => {
    try {
        const { menuId, quantity: newQuantity, total } = validate(createCartValidation, req.body);


        let existingCart = await Cart.findOne({
            where: { menuId, userId: req.user.id },
            include: { model: Menu, attributes: ['price'] },
            attributes: ['id', 'quantity', 'total', 'createdAt', 'updatedAt']

        });
        if (!existingCart) {
            throw new ResponseError(404, false, "Menu is not found", null);
        } else if (existingCart) {
            const total = existingCart.total + (newQuantity * existingCart.Menu.price);
            const quantity = existingCart.quantity + newQuantity;

            await existingCart.update({ quantity, total });
            existingCart = await existingCart.reload();
        } else {
            existingCart = await Cart.create({ menuId, total, quantity: newQuantity, userId: req.user.id });
        }

        const user = await User.findByPk(req.user.id, { attributes: ['id', 'name'] });
        const menu = await Menu.findByPk(menuId, { attributes: ['id', 'name', 'price', 'image'] });


        const responseData = {
            id: existingCart.id,
            Menu: {
                id: menu.id,
                name: menu.name,
                price: menu.price,
                image: menu.image
            },
            quantity: existingCart.quantity,
            total: existingCart.total,
            User: { id: user.id, name: user.name },
            createdAt: existingCart.createdAt,
            updatedAt: existingCart.updatedAt,
        };

        res.status(200).json({
            status: true,
            statusResponse: 200,
            message: "OK",
            data: responseData
        });
        logger.info(`Created or updated cart successfully`);
    } catch (error) {
        logger.error(`Error in create cart function: ${error.message}`);
        logger.error(error.stack);
        next(error);
    }
};



export default {
    getCarts,
    getCart,
    createCart
};