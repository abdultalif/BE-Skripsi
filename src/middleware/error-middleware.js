import { ResponseError } from "../error/response-error.js";

const errorMiddleware = async (err, req, res, next) => {
    if (!err) {
        next();
        return;
    }

    if (err instanceof ResponseError) {
        res.status(err.statusResponse).json({
            statusResponse: err.statusResponse,
            status: err.status,
            errors: err.errors,
            message: err.message,
            data: err.data,
        }).end();
    } else {
        res.status(500).json({
            errors: err.message
        }).end();
    }
}

export {
    errorMiddleware
}