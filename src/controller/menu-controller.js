import { ResponseError } from "../error/response-error.js";
import logger from "../middleware/logging-middleware.js";
import Menu from "../model/menu-model.js";
import { createMenuValidation, updateMenuValidation } from "../validation/menus-validation.js";
import { validate } from "../validation/validation.js";
import fs from "fs";


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
        await Menu.create({
            ...menuCreate
        });
        res.status(201).json({
            status: true,
            statusResponse: 201,
            message: "Created menu successfully",
            data: menuCreate
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
        const menusExists = await Menu.findAll();

        if (menusExists.length === 0) {
            throw new ResponseError(404, false, "Menu is not found", null);
        }

        return res.status(200).json({
            status: true,
            statusResponse: 200,
            message: "OK",
            data: menusExists
        });
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
            throw new ResponseError(404, false, "Menu is not found", null);
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
        return res.status(200).json({
            status: true,
            statusResponse: 200,
            message: "OK",
            data: null
        });
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

        return res.status(200).json({
            status: true,
            statusResponse: 200,
            message: "OK",
            data: menuExists
        });
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
        const result = await Menu.update({ ...menuUpdate }, { where: { id: menuId } });
        return res.status(200).json({
            status: true,
            statusResponse: 200,
            message: "Update menu successfully",
            data: menuUpdate
        });
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



// const updateMenu = async (req, res, next) => {
//     try {
//         const { menuId } = req.params;
//         const menu = req.body;
//         const imageMenu = req.file;

//         const menuExists = await Menu.findByPk(menuId);
//         if (!menuExists) {
//             throw new ResponseError(404, false, "Menu tidak ditemukan", null);
//         }

//         // Periksa apakah gambar baru diunggah
//         if (imageMenu) {
//             // Hapus gambar lama jika ada
//             if (menuExists.image) {
//                 const filePath = `uploads/menu/${menuExists.image}`;
//                 fs.unlinkSync(filePath);
//             }
//             // Tetapkan nama file gambar baru pada objek menu
//             menu.image = req.file.filename;
//         } else {
//             // Jika tidak ada gambar baru, tetapkan nama file gambar lama
//             menu.image = menuExists.image;
//         }

//         // Validasi menu yang diperbarui
//         const menuUpdate = validate(updateMenuValidation, menu);

//         // Perbarui menu di database
//         const result = await Menu.update({ ...menuUpdate }, { where: { id: menuId } });

//         return res.status(200).json({
//             status: true,
//             statusResponse: 200,
//             message: "Menu berhasil diperbarui",
//             data: menuUpdate
//         });
//     } catch (error) {
//         // Jika terjadi kesalahan, hapus gambar yang baru diunggah (jika ada)
//         if (req.file) {
//             const filePath = 'uploads/menu/' + req.file.filename;
//             fs.unlinkSync(filePath);
//         }
//         logger.error(`Kesalahan dalam fungsi pembaruan menu ${error.message}`);
//         logger.error(error.stack);
//         next(error);
//     }
// };



export default {
    getMenus,
    getMenu,
    createMenu,
    deleteMenu,
    updateMenu
};