import { ResponseError } from "../error/response-error.js";
import { verifyAccessToken } from "../utils/jwt.js";

const authentication = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    // console.log(token)
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

export {
    authentication
};