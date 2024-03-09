import { ResponseError } from "../error/response-error.js";
import { verifyAccessToken } from "../utils/jwt.js";
import logger from "./logging-middleware.js";

const authentication = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        throw new ResponseError(401, false, "Unauthorized", null);
    }

    const user = verifyAccessToken(token);
    if (!user) {
        throw new ResponseError(401, false, "Unauthorized", null);
    }

    req.user = user;
    next();
};

const isAdmin = (req, res, next) => {
    if (!req.user.isAdmin) {
        throw new ResponseError(403, false, "Forbidden.. Kamu bukan admin", null);
    }
    next();
};

export {
    authentication,
    isAdmin
};