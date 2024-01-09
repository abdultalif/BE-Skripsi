import sequelize from "../utils/db.js";
import { Sequelize } from "sequelize";
import user from "./user-model.js";

const contact = sequelize.define('Contact', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    firstName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    lastName: {
        type: Sequelize.STRING,
        allowNull: true
    },
    fullName: {
        get() {
            return this.firstName + " " + this.lastName;
        }
    },
    email: {
        type: Sequelize.STRING,
        validate: {
            isEmail: true
        },
        set(value) {
            this.setDataValue("email", value.toLowerCase());
        },
    },
    phone: {
        type: Sequelize.STRING,
        allowNull: true
    }
},
    {
        tableName: 'contacts',
        underscored: true,
        timestamps: true
    }
);

user.hasMany(contact, {
    foreignKey: 'id',
    onUpdate: 'RESTRICT',
    onDelete: 'RESTRICT',
});

contact.hasMany(user, {
    foreignKey: 'userId',
    onUpdate: 'RESTRICT',
    onDelete: 'RESTRICT',
});

sequelize.sync();

export default contact;