import sequelize from "../utils/db.js";
import { Sequelize } from "sequelize";
import contact from "./contact-model.js";


const address = sequelize.define(
    "Address",
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        addressType: {
            type: Sequelize.STRING,
            allowNull: false
        },
        street: {
            type: Sequelize.STRING,
            allowNull: false
        },
        city: {
            type: Sequelize.STRING,
        },
        province: {
            type: Sequelize.STRING,
        },
        country: {
            type: Sequelize.STRING,
        },
        zipCode: {
            type: Sequelize.STRING,
        },
    },
    {
        tableName: 'address',
        timestamps: true,
        underscored: true
    }
);


contact.hasMany(address, {
    foreignKey: 'id',
    onUpdate: 'RESTRICT',
    onDelete: 'RESTRICT',
});

address.hasMany(contact, {
    foreignKey: 'contactId',
    onUpdate: 'RESTRICT',
    onDelete: 'RESTRICT',
});


sequelize.sync();

export default address;