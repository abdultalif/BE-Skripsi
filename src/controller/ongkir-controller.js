import axios from "axios";
import "dotenv/config";
import logger from "../middleware/logging-middleware.js";

axios.defaults.baseURL = 'https://api.rajaongkir.com/starter';
axios.defaults.headers.common['key'] = process.env.ONGKIR_KEY;
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';


const province = async (req, res, next) => {
    try {
        const response = await axios.get('/province');
        res.status(200).json(response.data)
    } catch (error) {
        logger.error(`Error in get province function ${error.message}`);
        logger.error(error.stack);
        next(error)
    }
}

const city = async (req, res, next) => {
    try {
        const response = await axios.get(`/city?province=${req.params.provinceId}`);
        res.status(200).json(response.data)
    } catch (error) {
        logger.error(`Error in get city function ${error.message}`);
        logger.error(error.stack);
        next(error)
    }
}

const ongkir = async (req, res, next) => {
    try {
        const response = await axios.post('/cost', {
            origin: 78,
            destination: parseInt(req.body.destination),
            weight: 2000,
            courier: req.body.courier
        });
        res.status(200).json(response.data)
    } catch (error) {
        logger.error(`Error in get ongkir function ${error.message}`);
        logger.error(error.stack);
        next(error)
    }
}

export default {
    province,
    city,
    ongkir
}