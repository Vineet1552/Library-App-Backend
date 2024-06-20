const Joi = require('joi');

module.exports.studentSignup = Joi.object({
    name: Joi.string().required().error(new Error("please enter name")),
    age: Joi.number().required().error(new Error("please enter age")),
    mobile: Joi.string().required().error(new Error("please enter mobile number")),
    email: Joi.string().email().required().error(new Error("please enter a email it is mandatory")),
    studentUid: Joi.string().required().error(new Error("please enter student UID")),
    password: Joi.string().required().error(new Error("please enter password"))
});

module.exports.studentSignin = Joi.object({
    studentUid: Joi.string().required().error(new Error("please enter Student UID")),
    password: Joi.string().required().error(new Error("please enter password"))
});

module.exports.writeReview = Joi.object({
    review: Joi.string().required().error(new Error("please write review"))
});