import { Op } from "sequelize";
import { ResponseError } from "../error/response-error.js";
import logger from "../middleware/logging-middleware.js";
import Menu from "../model/menu-model.js";
import { createMenuValidation, updateMenuValidation } from "../validation/menus-validation.js";
import { validate } from "../validation/validation.js";
import fs from "fs";
import Order from "../model/order-model.js";
import Review from "../model/review-model.js";


const createMenu = async (req, res, next) => {
    try {
        const imageMenu = req.file;
        const menu = req.body;
        menu.image = imageMenu;

        const menuCreate = await validate(createMenuValidation, menu);

        const menuExists = await Menu.findOne({
            where: {
                name: menuCreate.name,
            }
        });
        if (menuExists) {
            throw new ResponseError(400, false, "Menu already exist", null);
        }

        menuCreate.image = req.file.filename;
        const result = await Menu.create({
            ...menuCreate,
            userId: req.user.id
        });
        res.status(201).json({
            status: true,
            statusResponse: 201,
            message: "Created menu successfully",
            data: result
        });

        logger.info(`Created menu ${menuCreate.name} successfully`);
    } catch (error) {
        if (req.file) {
            const filePath = 'uploads/menu/' + req.file.filename;
            fs.unlinkSync(filePath);
        }

        logger.error(`Error in create menu function ${error.message}`);
        logger.error(error.stack);
        next(error);
    }
};

const getMenus = async (req, res, next) => {
    try {
        const menusExists = await Menu.findAll({
            order: [['createdAt', 'DESC']]
        });

        if (menusExists.length === 0) {
            throw new ResponseError(404, false, "Menu is not found", null);
        }

        res.status(200).json({
            status: true,
            statusResponse: 200,
            message: "OK",
            data: menusExists
        });
        logger.info(`Get menus successfully`);
    } catch (error) {
        logger.error(`Error in get menus function ${error.message}`);
        logger.error(error.stack);
        next(error);
    }
};


const deleteMenu = async (req, res, next) => {
    try {
        const { menuId } = req.params;
        const menuExists = await Menu.findOne({
            where: {
                id: menuId
            }
        });
        if (!menuExists) {
            throw new ResponseError(404, false, "Menu not found", null);
        }

        if (menuExists.image) {
            const filePath = `uploads/menu/${menuExists.image}`;
            fs.unlinkSync(filePath);
        }

        await Menu.destroy({
            where: {
                id: menuId
            }
        });
        res.status(200).json({
            status: true,
            statusResponse: 200,
            message: "OK",
            data: null
        });
        logger.info(`Delete menu ${menuExists.name} successfully`);

    } catch (error) {
        logger.error(`Error in delete menu function ${error.message}`);
        logger.error(error.stack);
        next(error);
    }
};

const getMenu = async (req, res, next) => {
    try {
        const { menuId } = req.params;
        const menuExists = await Menu.findOne({
            where: {
                id: menuId
            }
        });

        if (!menuExists) {
            throw new ResponseError(404, false, "Menu is not found", null);
        }

        res.status(200).json({
            status: true,
            statusResponse: 200,
            message: "OK",
            data: menuExists
        });

        logger.info(`Get menu ${menuExists.name} successfully`);

    } catch (error) {
        logger.error(`Error in get menu function ${error.message}`);
        logger.error(error.stack);
        next(error);
    }
};

const updateMenu = async (req, res, next) => {
    try {
        const { menuId } = req.params;
        const menu = req.body;
        const imageMenu = req.file;
        menu.image = imageMenu;

        const menuExists = await Menu.findByPk(menuId);
        if (!menuExists) {
            throw new ResponseError(404, false, "Menu is not found", null);
        }

        const menuUpdate = validate(updateMenuValidation, menu);

        if (imageMenu) {
            const filePath = `uploads/menu/${menuExists.image}`;
            fs.unlinkSync(filePath);
        }


        if (imageMenu) {
            menuUpdate.image = req.file.filename;
        }
        await Menu.update({ ...menuUpdate }, { where: { id: menuId } });
        const result = await Menu.findByPk(menuId);

        res.status(200).json({
            status: true,
            statusResponse: 200,
            message: "Update menu successfully",
            data: result
        });

        logger.info(`Update menu ${menuUpdate.name} successfully`);

    } catch (error) {
        if (req.file) {
            const filePath = 'uploads/menu/' + req.file.filename;
            fs.unlinkSync(filePath);
        }
        logger.error(`Error in update menu function ${error.message}`);
        logger.error(error.stack);
        next(error);
    }
};

const cariMenu = async (req, res, next) => {
    try {
        if (!req.query.cari) {
            throw new ResponseError(404, false, "Menu is not found", null);
        }
        const menus = await Menu.findAll({
            where: {
                name: {
                    [Op.like]: `%${req.query.cari}%`
                },
            }
        });
        res.status(200).json({
            status: true,
            statusResponse: 200,
            message: "OK",
            data: menus
        });
        logger.info(`Cari menu successfully`);
    } catch (error) {
        logger.error(`Error in cari menu function ${error.message}`);
        logger.error(error.stack);
        next(error);
    }
}


export default {
    getMenus,
    getMenu,
    createMenu,
    deleteMenu,
    cariMenu,
    updateMenu,
};