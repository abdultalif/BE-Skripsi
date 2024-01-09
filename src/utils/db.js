import { Sequelize } from "sequelize";
import "dotenv/config";

const sequelize = new Sequelize(
    process.env.DB_DATABASE,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: process.env.DB_DIALECT,
        logging:
            process.env.NODE_ENV === "development"
                ? (...msg) => console.log(msg)
                : false,
        timezone: "Asia/Jakarta",
        // dialectOptions: {
        //     requestTimeout: 30000,
        //     // encrypt: true,
        //     // useUTC: false, // for reading from database
        //     dateStrings: true,
        //     typeCast(field, next) {
        //         // for reading from database
        //         if (field.type === "DATETIME") {
        //             return field.string();
        //         }
        //         return next();
        //     },
        // },
        // insecureAuth: true,
    }
);

export default sequelize;