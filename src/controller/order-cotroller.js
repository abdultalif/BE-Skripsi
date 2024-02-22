import "dotenv/config";
import midtransClient from "midtrans-client";
import logger from "../middleware/logging-middleware.js";
import { v4 as order_id } from 'uuid';
import Order from "../model/order-model.js";
import OrdersItems from "../model/order-item-model.js";
import Cart from "../model/cart-model.js";

let snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: process.env.SERVER_KEY,
});

const createOrder = async (req, res, next) => {
    try {
        const items = req.body.items;

        const itemDetails = items.map(item => ({
            id: item.menuId,
            price: item.price,
            quantity: item.quantity,
            name: item.menu,
        }));
        const parameter = {
            transaction_details: {
                order_id: order_id(),
                gross_amount: req.body.total,
            },
            credit_card: {
                secure: true,
            },
            item_details: itemDetails,
            customer_details: {
                first_name: req.user.name,
                email: req.user.email,
                phone: req.user.phone
            },
            callbacks: {
                finish: `http://127.0.0.1:5500/index.html`,
                error: `http://127.0.0.1:5500/index.html`,
                pending: `http://127.0.0.1:5500/index.html`,
            },
        };


        const transaction = await snap.createTransaction(parameter);

        const transactionToken = transaction.token;
        console.log(transactionToken);
        res.status(201).json({
            redirect_url: transaction.redirect_url,
            token: transactionToken,
            pesan: 'test'
        });

        await Order.create({
            id: parameter.transaction_details.order_id,
            userId: req.user.id,
            totalPrice: req.body.total,
            token: transactionToken,
            status: 'pending',
            responseMidtrans: JSON.stringify(transaction)
        });

        const orderItems = items.map(item => ({
            menuId: item.menuId,
            quantity: item.quantity,
            subtotal: item.price * item.quantity,
            orderId: parameter.transaction_details.order_id
        }));


        await OrdersItems.bulkCreate(orderItems);

        await Cart.destroy({ where: { userId: req.user.id } });

        logger.info(`Create order successfully`);
        // transaction token

    } catch (error) {
        logger.error(`Error in create order function: ${error.message}`);
        logger.error(error.stack);
        next(error);
    }
}


export default {
    createOrder,
};
