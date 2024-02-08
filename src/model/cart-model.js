import sequelize from "../utils/db.js";
import { Sequelize } from "sequelize";
import User from "./user-model.js";
import Menu from "./menu-model.js";

const Cart = sequelize.define('Cart', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    subTotal: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    menuId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
            model: Menu,
            key: 'id'
        }
    },
    userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    }
}, {
    tableName: 'carts',
    timestamps: true
});

User.hasMany(Cart, {
    foreignKey: 'userId'
});

Cart.belongsTo(User, {
    foreignKey: 'userId'
});

Menu.hasMany(Cart, {
    foreignKey: 'menuId'
});

Cart.belongsTo(Menu, {
    foreignKey: 'menuId'
});

(async () => {
    await sequelize.sync();
})();

export default Cart;
