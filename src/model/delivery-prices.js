import { Sequelize } from "sequelize";
import sequelize from "../utils/db.js";

const Delivery = sequelize.define('delivery-price', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    region: {
        type: Sequelize.STRING,
        allowNull: false
    },
    price: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
},
    {
        tableName: "delivery-prices",
        timestamps: true,
    }
);

(async () => {
    await sequelize.sync();
})();


export default Delivery