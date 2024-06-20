const express = require('express');
const router = express.Router();
const Admin = require('../models/adminModel');
const bcrypt = require('bcrypt');
const sendMail = require('../services/nodeMailer');
const { generateToken, verifyToken } = require('../services/jwt');
const Store = require('../models/storeModel');
const {adminSignin, adminSignup, postBooks, editBooks} = require('../validations/adminValidator');

const validateReq = (schema) => (req, res, next) => {
    const {error} = schema.validate(req.body);
    if(error) {
        return res.status(400).json({ message: error.message });
    }
    next();
}

// admin created
router.post('/signup', validateReq(adminSignup), async(req, res) => {
    try {
        const adminData = req.body;
        const hashedPassword = await bcrypt.hash(adminData.password, 10);
        const newAdmin = new Admin({
            name: adminData.name,
            employeeId: adminData.employeeId,
            email: adminData.email,
            password: hashedPassword
        });
        
        const response = await newAdmin.save();
        sendMail(adminData.email, "Your account is created", "You are regestred as admin!");
        res.status(200).json({response});

    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Internal server error"});
    }
});


// admin signin
router.post('/signin', validateReq(adminSignin), async(req, res) => {
    try {
        const {employeeId, password} = req.body;
        const adminData = await Admin.findOne({employeeId: employeeId});
        if(!adminData) {
            return res.status(404).json({message: "Admin not found"});
        }
        console.log(adminData, "adminData");

        const isMatchPassword = await bcrypt.compare(password, adminData.password);
        if(!isMatchPassword) {
            return res.status(404).json({message: "password not matched please check once"});
        }

        console.log(isMatchPassword, "isMatchPassword");

        const payload = {
            id: adminData._id,
        }
        console.log(payload, "payload");
        const token = generateToken(payload);
        return res.status(200).json({token, message: "token created"});
        

    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Internal server error"});
    }
});

// post the books in the store
router.post('/postbooks', verifyToken, validateReq(postBooks), async(req, res) => {
    const adminId = req.id.id;
    try {
        const admin = await Admin.findById(adminId);
        if(!admin) {
            return res.status(404).json({message: "Only admin is allowed to post the books in the library"});
        }
        const BookData = req.body;
        const newBook = new Store(BookData);

        const response = await newBook.save();
        console.log("Book data saved in the dataBase");
        return res.status(200).json({response, message: "book data saved!"});


    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Internal server error"});
    }
});

// edit book details
router.put('/editBooks/:bookId', verifyToken, validateReq(editBooks), async (req, res) => {
    const adminId = req.id.id;
    try {
        const admin = await Admin.findById(adminId);
        console.log(admin, "admin");
        if (!admin) {
            return res.status(404).json({ message: "Only admin is allowed to edit the details" });
        }

        const bookId = req.params.bookId;

        const updatedBookData = req.body;
        const response = await Store.findByIdAndUpdate(bookId, updatedBookData, {
            new: true,
            runValidators: true
        });

        if (!response) {
            return res.status(404).json({ message: "Book not found!" });
        }

        console.log("Book data updated successfully!");
        return res.status(200).json({ response, message: "Data Updated!" });

    } catch (error) {
        console.error(error);

        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: "Book not found!" });
        }

        return res.status(500).json({ message: "Internal server error" });
    }
});


// delete books from the db
router.delete('/deleteBook/:bookId', verifyToken, async(req, res) => {
    const adminId = req.id.id;
    console.log(adminId, "adminId");
    try {
        const admin = await Admin.findById(adminId);
        if(!admin) {
            return res.status(404).json({message: "only admin is allowed to delete the book!"});
        }
        const bookId = req.params.id;
        const response = await Store.findByIdAndDelete(bookId);
        if(!response) {
            return res.status(404).json({message: "Book not found!"});
        }
        return res.status(200).json({message: "book deleted successfully"});

    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Internal server error"});
    }
});

module.exports = router;