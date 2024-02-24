import "dotenv/config";
import midtransClient from "midtrans-client";
import logger from "../middleware/logging-middleware.js";
import { v4 as order_id } from 'uuid';
import Order from "../model/order-model.js";
import OrdersItems from "../model/order-item-model.js";
import Cart from "../model/cart-model.js";
import { ResponseError } from "../error/response-error.js";
import crypto from "crypto";


const snap = new midtransClient.Snap({
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
            expiry: {
                unit: "minutes",
                duration: 10
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

    } catch (error) {
        logger.error(`Error in create order function: ${error.message}`);
        logger.error(error.stack);
        next(error);
    }
}


const midtransWebhook = async (req, res, next) => {
    try {
        const midtransStatus = req.body.transaction_status;
        const orderId = req.body.order_id;
        const statusCode = req.body.status_code;
        const grossAmount = req.body.gross_amount;
        const serverKey = process.env.SERVER_KEY;

        const dataString = orderId + statusCode + grossAmount + serverKey;
        const SignatureKey = crypto.createHash('sha512').update(dataString).digest('hex');

        if (SignatureKey === req.body.signature_key) {
            const order = await Order.findOne({ where: { id: orderId } });

            if (!order) throw new ResponseError(404, false, 'Order not found', null);

            switch (midtransStatus) {
                case 'capture':
                case 'settlement':
                    order.status = 'paid';
                    break;
                case 'pending':
                case 'deny':
                    order.status = 'pending';
                    break;
                case 'cancel':
                case 'expire':
                    order.status = 'cancelled';
                    break;
                case 'refund':
                    order.status = 'refunded';
                    break;
                default:
                    throw new ResponseError(400, false, 'Invalid transaction status', null);
            }

            await order.save()
            res.status(200).json({
                status: true,
                statusResponse: 200,
                message: 'Midtrans webhook received',
                data: order
            });

            logger.info(`Order ${orderId} status updated to ${order.status}`)
            console.log(req.body);
        } else {
            console.log('Invalid signature key');
            throw new ResponseError(400, false, 'Invalid signature key', null);
        }

    } catch (error) {
        logger.error(`Error in processing Midtrans webhook: ${error.message}`);
        logger.error(error.stack);
        next(error);
    }
}


export default {
    createOrder,
    midtransWebhook
};
