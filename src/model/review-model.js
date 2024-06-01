import sequelize from "../utils/db.js";
import { Sequelize } from "sequelize";
import User from "./user-model.js";
import Menu from "./menu-model.js";

const Review = sequelize.define('Reviews', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    rating: {
        type: Sequelize.STRING,
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

User.hasMany(Review, {
    foreignKey: 'userId'
});


Menu.hasMany(Review, {
    foreignKey: 'menuId'
});


(async () => {
    await sequelize.sync();
})();

export default Review;
