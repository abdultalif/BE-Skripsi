import sequelize from "../utils/db.js";
import { Sequelize } from "sequelize";

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
    }
);

(async () => {
    await sequelize.sync();
})();


export default Menu;