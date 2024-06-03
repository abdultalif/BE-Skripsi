import "dotenv/config";
import midtransClient from "midtrans-client";
import logger from "../middleware/logging-middleware.js";
import { v4 as order_id } from 'uuid';
import Order from "../model/order-model.js";
import OrdersItems from "../model/order-item-model.js";
import Cart from "../model/cart-model.js";
import { ResponseError } from "../error/response-error.js";
import crypto from "crypto";
import User from "../model/user-model.js";
import { Op } from "sequelize";
import Menu from "../model/menu-model.js";
import axios from "axios";
import sequelize from "../utils/db.js";


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
            // item_details: itemDetails,
            customer_details: {
                first_name: req.user.name,
                email: req.user.email,
                phone: req.user.phone
            },
            shipping_address: {
                first_name: req.user.name,
                email: req.user.email,
                phone: req.user.phone,
                address: req.body.address,
            },
            // expiry: {
            //     unit: "minutes",
            //     duration: 10
            // },
            callbacks: {
                finish: `http://127.0.0.1:5500/history-transaksi.html`,
                error: `http://127.0.0.1:5500/history-transaksi.html`,
                pending: `http://127.0.0.1:5500/history-transaksi.html`,
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
            shippingPrice: req.body.ongkir,
            status: 'Pending',
            shippingStatus: 'PROCESSING',
            address: req.body.address,
            token: transactionToken,
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
                    order.status = 'Success';
                    break;
                case 'pending':
                case 'deny':
                    order.status = 'Pending';
                    break;
                case 'cancel':
                case 'expire':
                    order.status = 'Cancelled';
                    break;
                case 'refund':
                    order.status = 'Refunded';
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

const getFilterCheckoutById = async (req, res, next) => {
    try {
        const filterCheckout = await Order.findAll({
            order: [['createdAt', 'DESC']],
            where: {
                status: {
                    [Op.like]: `%${req.query.status}%`
                },
                userId: req.user.id
            },
            include: [
                {
                    model: User,
                    attributes: ['id', 'name', 'email', 'phone']
                },
                {
                    model: OrdersItems,
                    attributes: ['id', 'quantity', 'subtotal'],
                    include: [{
                        model: Menu,
                        attributes: ['id', 'name', 'price', 'image', 'category']
                    }]
                }],
            attributes: ['id', 'totalPrice', 'status', 'token', 'shippingStatus', 'shippingPrice', 'address', 'resi', 'updatedAt']
        });
        res.status(200).json({
            status: true,
            statusResponse: 200,
            message: `History Transaction ${req.query.status} `,
            data: filterCheckout
        })
        logger.info(`Get checkout filter status ${req.query.status} successfully`);
    } catch (error) {
        logger.error(`Error in processing Get Checkout Filter : ${error.message}`);
        logger.error(error.stack);
        next(error);
    }
}


const getFilterCheckouts = async (req, res, next) => {
    try {
        const filterCheckout = await Order.findAll({
            order: [['createdAt', 'DESC']],
            where: {
                status: {
                    [Op.like]: `%${req.query.status}%`
                },
            },
            include: [
                {
                    model: User,
                    attributes: ['id', 'name', 'email', 'phone']
                },
                {
                    model: OrdersItems,
                    attributes: ['id', 'quantity', 'subtotal'],
                    include: [{
                        model: Menu,
                        attributes: ['id', 'name', 'price', 'image', 'category']
                    }]
                }],
            attributes: ['id', 'totalPrice', 'status', 'token', 'shippingStatus', 'shippingPrice', 'address', 'resi', 'updatedAt']
        });
        res.status(200).json({
            status: true,
            statusResponse: 200,
            message: `Get all orders Successfuly`,
            data: filterCheckout
        });
        logger.info('Get all orders Successfuly');
    } catch (error) {
        logger.error(`Error in processing Get Checkout : ${error.message}`);
        logger.error(error.stack);
        next(error);
    }
}

const getCheckout = async (req, res, next) => {
    try {
        const orderExist = await Order.findByPk(req.params.orderId);
        if (!orderExist) throw new ResponseError(404, false, 'Checkout not found', null);

        const checkout = await Order.findOne({
            where: { id: req.params.orderId },
            include: [
                {
                    model: User,
                    attributes: ['id', 'name', 'email', 'phone']
                },
                {
                    model: OrdersItems,
                    attributes: ['id', 'quantity', 'subtotal'],
                    include: [{
                        model: Menu,
                        attributes: ['id', 'name', 'price', 'image', 'category']
                    }]
                }],
            attributes: ['id', 'totalPrice', 'status', 'token', 'shippingStatus', 'shippingPrice', 'address', 'resi', 'updatedAt']
        });

        res.status(200).json({
            status: true,
            statusResponse: 200,
            message: `Data order dengan id: ${req.params.orderId}`,
            data: checkout
        });
        logger.info('Get order Successfuly');
    } catch (error) {
        logger.error(`Error in processing Get Checkout : ${error.message}`);
        logger.error(error.stack);
        next(error);
    }
}


const cancelTransaction = async (req, res, next) => {
    try {
        const url = `https://api.sandbox.midtrans.com/v2/${req.body.transaction_id}/cancel`;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + Buffer.from(process.env.SERVER_KEY + ':').toString('base64')
        }
        const data = {
            transaction_id: req.body.transaction_id
        };

        const response = await axios.post(url, data, { headers });

        if (response.data.transaction_status == 'cancel') {
            await Order.update({ status: 'Cancelled' }, { where: { id: req.body.transaction_id } });

        }

        res.status(200).json({
            status: true,
            statusResponse: 200,
            message: response.data.status_message,
            data: response.data,
        });
        logger.info('Cancel order Successfuly');


    } catch (error) {
        logger.error(`Error in processing Cancel Transaction : ${error.message}`);
        logger.error(error.stack);
        next(error);
    }
}


const updateStatusOngkir = async (req, res, next) => {
    try {
        const ongkirExist = await Order.findOne({
            where: { id: req.params.orderId },
        })
        if (!ongkirExist) throw new ResponseError(404, false, 'Order not found', null);

        ongkirExist.shippingStatus = req.body.shippingStatus;

        await ongkirExist.save();

        res.status(200).json({
            status: true,
            statusResponse: 200,
            message: 'Update status ongkir successfuly',
            data: ongkirExist,
        });
        logger.info('Update status ongkir successfuly');
    } catch (error) {
        logger.error(`Error in update status funtion : ${error.message}`);
        logger.error(error.stack);
        next(error);
    }
}


const resiUpdate = async (req, res, next) => {
    try {
        const orderExist = await Order.findOne({
            where: { id: req.params.orderId }
        })

        if (!orderExist) throw new ResponseError(404, false, 'Order not found')

        orderExist.shippingStatus = req.body.shippingStatus;
        orderExist.resi = req.body.resi;

        await orderExist.save();

        res.status(200).json({
            status: true,
            statusResponse: 200,
            message: 'Update resi successfuly',
            data: orderExist,
        });
        logger.info('Update resi successfuly');


    } catch (error) {
        logger.error(`Error in resi update function: ${error.message}`)
        logger.error(error.stack);
        next(error)
    }
}


const daily = async (req, res, next) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const orders = await Order.findAll({
            where: {
                createdAt: {
                    [Op.gte]: today,
                    [Op.lt]: tomorrow
                }
            },
            order: [['updatedAt', 'DESC']],
            include: [
                {
                    model: User,
                    attributes: ['id', 'name', 'email', 'phone']
                },
                {
                    model: OrdersItems,
                    attributes: ['id', 'quantity', 'subtotal'],
                    include: [{
                        model: Menu,
                        attributes: ['id', 'name', 'price', 'image', 'category']
                    }]
                }
            ],
            attributes: ['id', 'totalPrice', 'status', 'token', 'shippingStatus', 'shippingPrice', 'address', 'resi', 'updatedAt']

        });

        res.status(200).json({
            status: true,
            statusResponse: 200,
            message: 'Get order daily Successfuly',
            data: orders,
        });
        logger.info('Get order daily Successfuly');
    } catch (error) {
        next(error)
        logger.error(`Error in daily function: ${error.message}`)
        logger.error(error.stack)
    }
}

const yesterday = async (req, res, next) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const orders = await Order.findAll({
            where: {
                createdAt: {
                    [Op.gte]: yesterday,
                    [Op.lt]: today
                }
            },
            order: [['updatedAt', 'DESC']],
            include: [
                {
                    model: User,
                    attributes: ['id', 'name', 'email', 'phone']
                },
                {
                    model: OrdersItems,
                    attributes: ['id', 'quantity', 'subtotal'],
                    include: [{
                        model: Menu,
                        attributes: ['id', 'name', 'price', 'image', 'category']
                    }]
                }
            ],
            attributes: ['id', 'totalPrice', 'status', 'token', 'shippingStatus', 'shippingPrice', 'address', 'resi', 'updatedAt']
        });

        res.status(200).json({
            status: true,
            statusResponse: 200,
            message: 'Get order yesterday Successfuly',
            data: orders,
        });
        logger.info('Get order yesterday Successfuly');
    } catch (error) {
        next(error);
        logger.error(`Error in yesterday function: ${error.message}`);
        logger.error(error.stack);
    }
}


const weekly = async (req, res, next) => {
    try {
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 7);

        const orders = await Order.findAll({
            where: {
                createdAt: {
                    [Op.gte]: startOfWeek,
                    [Op.lt]: endOfWeek
                }
            },
            order: [['updatedAt', 'DESC']],
            include: [
                {
                    model: User,
                    attributes: ['id', 'name', 'email', 'phone']
                },
                {
                    model: OrdersItems,
                    attributes: ['id', 'quantity', 'subtotal'],
                    include: [{
                        model: Menu,
                        attributes: ['id', 'name', 'price', 'image', 'category']
                    }]
                }
            ],
            attributes: ['id', 'totalPrice', 'status', 'token', 'shippingStatus', 'shippingPrice', 'address', 'resi', 'updatedAt']
        });
        res.status(200).json({
            status: true,
            statusResponse: 200,
            message: 'Get order weekly Successfuly',
            data: orders,
        });
        logger.info('Get order weekly Successfuly');
    } catch (error) {
        next(error)
        logger.error(`Error in weekly function: ${error.message}`)
        logger.error(error.stack)
    }
}


const monthly = async (req, res, next) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

        const orders = await Order.findAll({
            where: {
                createdAt: {
                    [Op.gte]: startOfMonth,
                    [Op.lt]: endOfMonth
                }
            },
            order: [['updatedAt', 'DESC']],
            include: [
                {
                    model: User,
                    attributes: ['id', 'name', 'email', 'phone']
                },
                {
                    model: OrdersItems,
                    attributes: ['id', 'quantity', 'subtotal'],
                    include: [{
                        model: Menu,
                        attributes: ['id', 'name', 'price', 'image', 'category']
                    }]
                }
            ],
            attributes: ['id', 'totalPrice', 'status', 'token', 'shippingStatus', 'shippingPrice', 'address', 'resi', 'updatedAt']
        });
        res.status(200).json({
            status: true,
            statusResponse: 200,
            message: 'Get order monthly Successfuly',
            data: orders,
        });
        logger.info('Get order monthly Successfuly');
    } catch (error) {
        next(error)
        logger.error(`Error in monthly function: ${error.message}`)
        logger.error(error.stack)
    }
}


const yearly = async (req, res, next) => {
    try {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const endOfYear = new Date(now.getFullYear() + 1, 0, 1);

        const orders = await Order.findAll({
            where: {
                createdAt: {
                    [Op.gte]: startOfYear,
                    [Op.lt]: endOfYear
                }
            },
            order: [['updatedAt', 'DESC']],
            include: [
                {
                    model: User,
                    attributes: ['id', 'name', 'email', 'phone']
                },
                {
                    model: OrdersItems,
                    attributes: ['id', 'quantity', 'subtotal'],
                    include: [{
                        model: Menu,
                        attributes: ['id', 'name', 'price', 'image', 'category']
                    }]
                }
            ],
            attributes: ['id', 'totalPrice', 'status', 'token', 'shippingStatus', 'shippingPrice', 'address', 'resi', 'updatedAt']
        });
        res.status(200).json({
            status: true,
            statusResponse: 200,
            message: 'Get order yearly Successfully',
            data: orders,
        });
        logger.info('Get order yearly Successfully');
    } catch (error) {
        next(error)
        logger.error(`Error in yearly function: ${error.message}`)
        logger.error(error.stack)
    }
}

const getCheckoutsLimit5 = async (req, res, next) => {
    try {
        const filterCheckout = await Order.findAll({
            order: [['updatedAt', 'DESC']],
            limit: 5,
            include: [
                {
                    model: User,
                    attributes: ['id', 'name', 'email', 'phone']
                },
                {
                    model: OrdersItems,
                    attributes: ['id', 'quantity', 'subtotal'],
                    include: [{
                        model: Menu,
                        attributes: ['id', 'name', 'price', 'image', 'category']
                    }]
                }],
            attributes: ['id', 'totalPrice', 'status', 'token', 'shippingStatus', 'shippingPrice', 'address', 'resi', 'updatedAt']
        });
        res.status(200).json({
            status: true,
            statusResponse: 200,
            message: `Get 5 DESC orders Successfuly`,
            data: filterCheckout
        });
        logger.info('Get 5 DESC orders Successfuly');
    } catch (error) {
        logger.error(`Error in processing Get Checkout : ${error.message}`);
        logger.error(error.stack);
        next(error);
    }
}

const orderStatus = async (req, res, next) => {
    try {
        const statuses = await Order.findAll({
            attributes: ['status', [sequelize.fn('COUNT', sequelize.col('status')), 'count']],
            group: ['status']
        });

        const data = { status: {} };
        statuses.forEach(item => {
            data.status[item.status] = item.get('count');
        });

        res.status(200).json({
            message: "Get count status successfully",
            data: data
        })
        logger.info("Get count status successfully");
    } catch (error) {
        logger.error(`Error in order status function: ${error.message}`);
        logger.error(error.stack);
        next(error)
    }
}

const getTotalQuantity = async (req, res, next) => {
    try {
        const [results] = await sequelize.query(`
        SELECT SUM(oi.quantity) AS totalQuantity
        FROM orders_items oi
        INNER JOIN orders o ON oi.orderId = o.id
        WHERE o.status = 'Success'
    `);

        const totalQuantity = results[0].totalQuantity;

        res.status(200).json({
            status: true,
            statusResponse: 200,
            message: 'Total quantity retrieved successfully',
            data: totalQuantity
        });
        logger.info("Total quantity retrieved successfully");
    } catch (error) {
        logger.error(`Error in get total quantity function: ${error.message}`);
        logger.error(error.stack);
        next(error)
    }
}

const getTotalPrice = async (req, res, next) => {
    try {
        const total = await Order.sum('totalPrice', {
            where: {
                status: "Success"
            }
        });
        res.status(200).json({
            status: true,
            statusResponse: 200,
            message: 'Total price retrieved successfully',
            data: total
        });
        logger.info("Total price retrieved successfully");
    } catch (error) {
        logger.error(`Error in get total price function: ${error.message}`);
        logger.error(error.stack);
        next(error)
    }
}


const getOrdersCount = async (req, res, next) => {
    try {
        const ordersCount = await Order.count({
            where: {
                status: "Success"
            }
        });
        res.status(200).json({
            status: true,
            statusResponse: 200,
            message: 'Order count retrieved successfully',
            data: ordersCount
        });
        logger.info("Order count retrieved successfully");
    } catch (error) {
        logger.error(`Error in get Order count function: ${error.message}`);
        logger.error(error.stack);
        next(error);
    }
};




export default {
    createOrder,
    midtransWebhook,
    getFilterCheckoutById,
    getFilterCheckouts,
    cancelTransaction,
    getCheckout,
    updateStatusOngkir,
    resiUpdate,
    daily,
    yesterday,
    weekly,
    monthly,
    yearly,
    getCheckoutsLimit5,
    orderStatus,
    getTotalQuantity,
    getTotalPrice,
    getOrdersCount
};
