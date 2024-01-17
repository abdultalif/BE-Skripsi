import sequelize from "../utils/db.js";
import { Sequelize } from "sequelize";

const Menu = sequelize.define("Menu", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
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
},
    {
        tableName: "menus",
        timestamps: true,
        underscored: true
    }
);

(async () => {
    await sequelize.sync();
})();


export default Menu;