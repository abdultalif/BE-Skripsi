import { ResponseError } from "../error/response-error.js";
import logger from "../middleware/logging-middleware.js";
import Testimonial from "../model/testimonial-model.js";
import { createTestimonialValidation, updateTestimonialValidation } from "../validation/testimonials-validation.js";
import { validate } from "../validation/validation.js";
import fs from "fs";

const getTestimonials = async (req, res, next) => {
    try {
        const testimonials = await Testimonial.findAll();

        if (testimonials.length === 0) {
            throw new ResponseError(404, false, "Tesimoni is not found", null);
        }
        res.status(200).json({
            status: true,
            statusResponse: 200,
            message: "OK",
            data: testimonials
        });
        logger.info(`Get Testimonials successfully`);
    } catch (error) {
        logger.error(`Error in getTestimonials function: ${error.message}`);
        logger.error(error.stack);
        next(error);
    }
};

const createTestimonial = async (req, res, next) => {
    try {
        const image = req.file;
        const testimonial = req.body;
        testimonial.image = image;

        const testimonialCreate = validate(createTestimonialValidation, testimonial);

        testimonialCreate.image = req.file.filename;
        const result = await Testimonial.create({ ...testimonialCreate });
        res.status(201).json({
            status: true,
            statusResponse: 201,
            message: "Created testimonial successfully",
            data: result
        });

        logger.info(`Created testimonial ${result.name} successfully`);
    } catch (error) {
        if (req.file) {
            const filePath = 'uploads/testimonial/' + req.file.filename;
            fs.unlinkSync(filePath);
        }
        logger.error(`Error in create testimonial function ${error.message}`);
        logger.error(error.stack);
        next(error);
    }
};

const getTestimonial = async (req, res, next) => {
    try {
        const { testimonialId } = req.params;
        const result = await Testimonial.findOne({
            where: {
                id: testimonialId
            }
        });
        if (!result) throw new ResponseError(404, false, "Testimonial is not found", null);
        res.status(200).json({
            status: true,
            statusResponse: 200,
            message: "OK",
            data: result
        });
        logger.info(`Get Testimonial successfully`);
    } catch (error) {
        logger.error(`Error in getTestimonial function: ${error.message}`);
        logger.error(error.stack);
        next(error);
    }
};

const deleteTestimonial = async (req, res, next) => {
    try {
        const { testimonialId } = req.params;
        const testimonialExist = await Testimonial.findByPk(testimonialId);
        if (!testimonialExist) throw new ResponseError(404, false, 'Testimonial is not found', null);
        if (testimonialExist) {
            const filePath = `uploads/testimonial/${testimonialExist.image}`;
            fs.unlinkSync(filePath);
        }
        await Testimonial.destroy({ where: { id: testimonialId } });
        res.status(200).json({
            status: true,
            statusResponse: 200,
            message: "OK",
            data: null
        });
        logger.info('Deleted testimonial successfuly');
    } catch (error) {
        logger.error(`Error in delete testimonial function: ${error.message}`);
        logger.error(error.stack);
        next(error);
    }
};

const updateTestimonial = async (req, res, next) => {
    try {
        const { testimonialId } = req.params;
        const data = req.body;
        data.image = req.file;

        const testimonialExist = await Testimonial.findByPk(testimonialId);

        if (!testimonialExist) throw new ResponseError(404, false, 'Testimoni is not found', null);

        const testimonialUpdate = validate(updateTestimonialValidation, data);

        if (testimonialUpdate.image) {
            const filePath = `uploads/testimonial/${testimonialExist.image}`;
            fs.unlinkSync(filePath);
        }
        if (req.file) {
            testimonialUpdate.image = req.file.filename;
        }
        await Testimonial.update({ ...testimonialUpdate }, { where: { id: testimonialId } });
        const result = await Testimonial.findByPk(testimonialId);
        res.status(200).json({
            status: true,
            statusResponse: 200,
            message: "Update testimoni successfuly",
            data: result
        });
        logger.info(`Update Testimoni Successfully`);
    } catch (error) {
        if (req.file) {
            const filePath = 'uploads/testimonial/' + req.file.filename;
            fs.unlinkSync(filePath);
        }
        logger.error(`Error in update testimonial function: ${error.message}`);
        logger.error(error.stack);
        next(error);
    }
};

export default {
    getTestimonials,
    createTestimonial,
    getTestimonial,
    deleteTestimonial,
    updateTestimonial
};