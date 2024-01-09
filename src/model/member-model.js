import sequelize from "../utils/db.js";
import { Sequelize } from "sequelize";

const Member = sequelize.define('Member', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    balance: {
        type: Sequelize.STRING,
        allowNull: false
    },
    transportation: {
        type: Sequelize.STRING,
        allowNull: false
    }
},
    {
        tableName: "members",
        timestamps: true,
        underscored: true
    });


sequelize.sync();


export default Member;