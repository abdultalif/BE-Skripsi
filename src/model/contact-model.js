import sequelize from "../utils/db.js";
import { Sequelize } from "sequelize";
import Address from "./address-model.js";

const Contact = sequelize.define('Contact', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    firstName: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    lastName: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    phone: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    user_id: {
        type: Sequelize.UUID,  // Sesuaikan dengan tipe data yang benar
        allowNull: false,
    },
},
    {
        tableName: 'contacts',
        timestamps: true,
        underscored: true
    });

Contact.hasMany(Address, {
    foreignKey: 'contactId',
    as: 'addresses', // <--- Penambahan ini untuk memberikan alias pada relasi
});

export default Contact;
