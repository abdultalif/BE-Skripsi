import logger from "../middleware/logging-middleware.js";
import Review from "../model/review-model.js";
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

export default {
    createReview
}