import sequelize from "../utils/db.js";
import { Sequelize } from "sequelize";

const Address = sequelize.define('Address', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    addressType: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    street: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    city: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    province: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    country: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    zipCode: {
        type: Sequelize.STRING,
        allowNull: false,
    },
},
    {
        tableName: 'address',
        timestamps: true,
        underscored: true
    });

export default Address;
