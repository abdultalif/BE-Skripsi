import sequelize from "../utils/db.js";
import { Sequelize } from "sequelize";
import { encript } from "../utils/bcrypt.js";
import moment from "moment";
import Contact from "./contact-model.js";

const User = sequelize.define('User', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    email: {
        type: Sequelize.STRING,
        unique: true,
        validate: {
            isEmail: true
        },
        set(value) {
            this.setDataValue("email", value.toLowerCase());
        }
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
        set(value) {
            this.setDataValue("password", encript(value));
        }
    },
    isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
    },
    expireTime: {
        type: Sequelize.DATE,
        set(value) {
            if (value !== null) {
                this.setDataValue("expireTime", moment(value).add(1, "hour"));
            } else {
                this.setDataValue("expireTime", null);
            }
        }
    },
    loginToken: {
        allowNull: true,
        type: Sequelize.TEXT,
    },
    forgotToken: {
        allowNull: true,
        type: Sequelize.TEXT,
    }
},
    {
        tableName: 'users',
        timestamps: true,
    });

User.hasMany(Contact, {
    foreignKey: 'userId',
});

Contact.belongsTo(User, {
    foreignKey: 'userId',
});


(async () => {
    await sequelize.sync();
})();


export default User;

