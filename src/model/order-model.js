import sequelize from "../utils/db.js";
import { Sequelize } from "sequelize";
import User from "./user-model.js";

const Order = sequelize.define('order', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
    },
    userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    totalPrice: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    shippingPrice: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    status: {
        type: Sequelize.ENUM('Success', 'Pending', 'Cancelled', 'Refunded'),
        allowNull: false,
    },
    shippingStatus: {
        type: Sequelize.ENUM('PROCESSING', 'SHIPPING', 'DELIVERED'),
        allowNull: false,
    },
    address: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    token: {
        type: Sequelize.UUID,
        allowNull: false,
    },
    responseMidtrans: {
        type: Sequelize.TEXT,
        allowNull: false
    }
}, {
    tableName: 'orders',
    timestamps: true
});

User.hasMany(Order, {
    foreignKey: 'userId'
});

Order.belongsTo(User, {
    foreignKey: 'userId'
});

(async () => {
    await sequelize.sync();
})();

export default Order;

