import logger from "../middleware/logging-middleware.js";
import Menu from "../model/menu-model.js";
import Review from "../model/review-model.js";
import User from "../model/user-model.js";
import { createReviewValidation } from "../validation/review-validation.js";
import { validate } from "../validation/validation.js";

const createReview = async (req, res, next) => {
    try {
        const reviews = await Promise.all(req.body.map(review => validate(createReviewValidation, review)));

        const reviewWithUserId = reviews.map(review => ({ ...review, userId: req.user.id }))

        const result = await Review.bulkCreate(reviewWithUserId);
        res.status(201).json({
            status: true,
            statusResponse: 201,
            message: "Created review successfully",
            data: result
        });
        logger.info(`create review successfuly`);
    } catch (error) {
        logger.error(`Error in create review function: ${error.message}`);
        logger.error(error.stack);
        next(error);
    }
};


const getReview = async (req, res, next) => {
    try {

        const result = await Review.findAll({
            where: {
                menuId: req.params.menuId
            },
            include: [
                {
                    model: User,
                    attributes: ['name']
                }
            ],
            order: [['updatedAt', 'DESC']],
        });


        res.status(200).json({
            status: true,
            statusResponse: 200,
            message: "Get review successfully",
            data: result
        });
        logger.info(`get review successfuly`);

    } catch (error) {

        logger.error(`Error in get review function: ${error.message}`);
        logger.error(error.stack);
        next(error);

    }
};

const getReviews = async (req, res, next) => {
    try {

        const result = await Review.findAll({
            where: {
                menuId: req.params.menuId,
                orderId: req.params.orderId,
                userId: req.user.id,
            },
            // include: [
            //     {
            //         model: User,
            //         attributes: ['name']
            //     }
            // ],
            // order: [['updatedAt', 'DESC']],
        });


        res.status(200).json({
            status: true,
            statusResponse: 200,
            message: "Get reviews successfully",
            data: result
        });
        logger.info(`get reviews successfuly`);

    } catch (error) {

        logger.error(`Error in get reviews function: ${error.message}`);
        logger.error(error.stack);
        next(error);

    }
}

export default {
    createReview,
    getReview,
    getReviews
}