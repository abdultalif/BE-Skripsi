// // contact-controller.js
// import logger from "../middleware/logging-middleware.js";
// import Contact from "../model/contact-model.js";
// import Address from "../model/address-model.js";
// import { validate } from "../validation/validation.js";
// import { createContactValidation } from "../validation/contacts-validation.js";

// const createContact = async (req, res, next) => {
//     try {
//         // Validasi request body menggunakan skema Joi
//         const validatedData = validate(createContactValidation, req.body);
//         const { firstName, lastName, email, phone } = validatedData;


//         // Create contact
//         const newContact = await Contact.create({
//             firstName: firstName,
//             lastName: lastName,
//             email: email,
//             phone: phone,
//             user_id: req.user.id
//         });

//         // // Create addresses
//         // if (addresses && addresses.length > 0) {
//         //     const addressPromises = addresses.map(addressData => {
//         //         return Address.create({ ...addressData, contactId: newContact.id });
//         //     });

//         //     await Promise.all(addressPromises);
//         // }

//         res.status(201).json(newContact);
//     } catch (error) {
//         logger.error(`Error in create contact function: ${error.message}`);
//         logger.error(error.stack);
//         next(error);
//     }
// };

// export default {
//     createContact
// };
