import sequelize from "../utils/db.js";
import { Sequelize } from "sequelize";
import User from "./user-model.js";

const Testimonial = sequelize.define('Testimonial', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
    },

    description: {
        allowNull: false,
        type: Sequelize.TEXT
    },
    rating: {
        allowNull: false,
        type: Sequelize.STRING
    },
    userId: {
        type: Sequelize.UUID,
        allowNull: false,
    },
},
    {
        tableName: 'testimonials',
        timestamps: true,
    });


Testimonial.belongsTo(User, {
    foreignKey: 'userId'
});

User.hasMany(Testimonial, {
    foreignKey: 'userId',
    onUpdate: 'RESTRICT',
    onDelete: 'RESTRICT'
});

(async () => {
    await sequelize.sync();
})();


export default Testimonial;

