import logger from "../middleware/logging-middleware.js";
import Delivery from "../model/delivery-prices.js";

const getPriceDelivery = async (req, res, next) => {
    try {

        const result = await Delivery.findAll();

        res.status(200).json({
            status: true,
            statusResponse: 200,
            message: "Get Price Delivery successfully",
            data: result
        });
        logger.info(`get Price Delivery successfuly`);

    } catch (error) {
        logger.error(`Error in get Price Delivery function: ${error.message}`);
        logger.error(error.stack);
        next(error);
    }
};


const getPriceDeliverybyRegion = async (req, res, next) => {
    try {
        const result = await Delivery.findOne({
            where: { region: req.body.region }
        });

        res.status(200).json({
            status: true,
            statusResponse: 200,
            message: "Get Price Delivery By Region successfully",
            data: result
        })
        logger.info(`get Price Delivery By Region successfuly`);
    } catch (error) {
        logger.error(`Error in get Price Delivery By Region function: ${error.message}`);
        logger.error(error.stack);
        next(error);
    }
}


export default {
    getPriceDelivery,
    getPriceDeliverybyRegion
}