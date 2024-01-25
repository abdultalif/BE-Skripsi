import sequelize from "../utils/db.js";
import { Sequelize } from "sequelize";
import User from "./user-model.js";

const Menu = sequelize.define("Menu", {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    description: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    price: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    stok: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    image: {
        type: Sequelize.STRING,
        allowNull: false
    },
    category: {
        type: Sequelize.STRING,
        allowNull: false
    },
    userId: {
        type: Sequelize.UUID,
        allowNull: false
    },
},
    {
        tableName: "menus",
        timestamps: true,
    }
);

Menu.belongsTo(User, {
    foreignKey: 'userId',
});

User.hasMany(Menu, {
    foreignKey: 'userId',
    onUpdate: 'RESTRICT',
    onDelete: 'RESTRICT',
});

(async () => {
    await sequelize.sync();
})();


export default Menu;