import { ResponseError } from "../error/response-error.js";
import logger from "../middleware/logging-middleware.js";
import Cart from "../model/cart-model.js";
import Menu from "../model/menu-model.js";
import User from "../model/user-model.js";

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
            attributes: ['id', 'quantity', 'subTotal', 'createdAt', 'updatedAt']
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
        logger.error(`Error in get cart function ${error.message}`);
        logger.error(error.stack);
        next(error);
    }
};

export default {
    getCarts
};