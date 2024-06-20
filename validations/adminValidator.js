// adminValidators.js
const Joi = require('joi');

module.exports.adminSignup = Joi.object({
    name: Joi.string().required().error(new Error("please enter name")),
    employeeId: Joi.string().required().error(new Error("please enter employeeId")),
    email: Joi.string().email().required().error(new Error("please enter a email it is mandatory")),
    password: Joi.string().required().error(new Error("please enter password"))
});

module.exports.adminSignin = Joi.object({
    employeeId: Joi.string().required().error(new Error("please enter employeeId")),
    password: Joi.string().required().error(new Error("please enter valid password"))
});

module.exports.postBooks = Joi.object({
    bookName: Joi.string().required().error(new Error("please enter bookName")),
    author: Joi.string().required().error(new Error("please enter author")),
    language: Joi.string().required().error(new Error("please enter language")),
    quantity: Joi.number().required().error(new Error("please enter quantity")),
});

module.exports.editBooks = Joi.object({
    bookName: Joi.string().error(new Error("please enter bookName")),
    author: Joi.string().error(new Error("please enter author")),
    language: Joi.string().error(new Error("please enter language")),
    quantity: Joi.number().error(new Error("please enter bookName")),
});