import sequelize from "../utils/db.js";
import { Sequelize } from "sequelize";
import User from "./user-model.js";
import Menu from "./menu-model.js";
import Order from "./order-model.js";

const Review = sequelize.define('Reviews', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    review: {
        type: Sequelize.TEXT,
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
    orderId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
            model: Order,
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
    tableName: 'reviews',
    timestamps: true
});

Menu.hasMany(Review, {
    foreignKey: 'menuId'
});

Review.belongsTo(Menu, {
    foreignKey: 'menuId'
});

User.hasMany(Review, {
    foreignKey: 'userId'
});

Review.belongsTo(User, {
    foreignKey: 'userId'
});

Order.hasMany(Review, {
    foreignKey: 'orderId'
});

Review.belongsTo(Order, {
    foreignKey: 'orderId'
});

(async () => {
    await sequelize.sync();
})();

export default Review;
