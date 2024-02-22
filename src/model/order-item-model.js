import sequelize from "../utils/db.js";
import { Sequelize } from "sequelize";
import Menu from "./menu-model.js";
import Order from "./order-model.js";

const OrdersItems = sequelize.define('orders_items', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    menuId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
            model: Menu,
            key: 'id'
        }
    },
    quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    subtotal: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    orderId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
            model: Order,
            key: 'id'
        }
    }
}, {
    freezeTableName: true,
    timestamps: true
});

Order.hasMany(OrdersItems, {
    foreignKey: 'orderId'
});

OrdersItems.belongsTo(Order, {
    foreignKey: 'orderId'
});

Menu.hasMany(OrdersItems, {
    foreignKey: 'menuId'
});

OrdersItems.belongsTo(Menu, {
    foreignKey: 'menuId'
});

(async () => {
    await sequelize.sync();
})();

export default OrdersItems;
