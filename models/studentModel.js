// studentmodel.js
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
    },
    mobile: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    studentUid: {
        type: String,
        required: true,
        uniqe: true
    },
    password: {
        type: String,
        required: true
    },
    books: [
        {
            bookName: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Store'
            }
        }
    ]
});


const Student = mongoose.model('Student', studentSchema);
module.exports = Student;
