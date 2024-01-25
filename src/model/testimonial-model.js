import sequelize from "../utils/db.js";
import { Sequelize } from "sequelize";

const Testimonial = sequelize.define('Testimonial', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
    },
    name: {
        allowNull: false,
        type: Sequelize.STRING,
    },
    description: {
        allowNull: false,
        type: Sequelize.TEXT
    },
    image: {
        allowNull: false,
        type: Sequelize.STRING
    },
    rating: {
        allowNull: false,
        type: Sequelize.STRING
    },
},
    {
        tableName: 'testimonials',
        timestamps: true,
    });

(async () => {
    await sequelize.sync();
})();


export default Testimonial;

