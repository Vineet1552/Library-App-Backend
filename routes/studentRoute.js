// studentRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Student = require('../models/studentModel');
const sendMail = require('../services/nodeMailer');
const {generateToken, verifyToken} = require('../services/jwt');
const Store = require('../models/storeModel');
const mongoose = require('mongoose');
const {studentSignup, studentSignin, writeReview} = require('../validations/studentValidator');
const agenda = require('../services/agenda');


const validateReq = (schema) => (req, res, next) => {
    const {error} = schema.validate(req.body);
    if(error) {
        return res.status(400).json({ message: error.message });
    }
    next();
}

router.post('/signup', validateReq(studentSignup), async(req, res) => {
    try {
        const studentData = req.body;
        const hashedPassword = await bcrypt.hash(studentData.password, 10);
        const newStudentData = new Student ({
            name: studentData.name,
            age: studentData.age,
            mobile: studentData.mobile,
            email: studentData.email,
            studentUid: studentData.studentUid,
            password: hashedPassword
        });

        const response = await newStudentData.save();
        sendMail(studentData.email, "Your account created", "Welcome to Library!");

        await agenda.schedule('in 1 minute', 'func return book', { email: studentData.email });
        res.status(200).json({response ,message: "student data saved successfully"});

    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Internal Server Error"});
    }
});

router.post('/signin', validateReq(studentSignin), async(req,res) => {
    try {
        const {studentUid, password} = req.body;
        const student = await Student.findOne({studentUid: studentUid});
        if(!student) {
            return res.status(404).json({message: "student not found"});
        }

        const isPassMatch = await bcrypt.compare(password, student.password);
        if(!isPassMatch) {
            return res.status(404).json({message: "Password not matched please check once"});
        }

        const playload = {
            id: student._id
        }

        const token = generateToken(playload);
        return res.status(200).json({token});

    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
});

// get all the current books
router.get('/books', verifyToken, async(req, res) => {
    const studentId = req.id.id;
    console.log(studentId, "studentId");
    try {
        const studentData = await Student.findById(studentId);
        if(!studentData) {
            return res.status(404).json({message: "Student not found"});
        }
        const response = await Store.find();
        const record = response.map((data) => {
            return {
                bookName: data.bookName,
                quantity: data.quantity
            }
        })

        return res.status(200).json({record});

    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
});

// assign books to the student
router.put('/assignBooks/:bookId', verifyToken, async(req, res) => {
    const studentID = req.id.id;
    console.log(studentID, "studentID");
    try {
        const bookId = req.params.bookId;
        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(404).json({ message: "Book not found" });
        }

        const studentData = await Student.findById(studentID);
        if(!studentData) {
            return res.status(404).json({message: "student not found!"});
        }

        const bookData = await Store.findById(bookId);
        if(!bookData) {
            return res.status(404).json({message: "book not found"});
        }

        // check the quantity of that book
        if(bookData.quantity < 1) {
            return res.status(400).json({message: "Currenlty book is out of stock"});
        }

        // assign the book to the student
        // const bookName = bookData.bookName;
        studentData.books.push({bookName: bookId});
        await studentData.save();
        bookData.quantity -= 1;
        await bookData.save();
        
        sendMail(studentData.email, "Library update", "book is assigned please return the book with in 10 days!");
        return res.status(200).json({message: "Book assigned to the student successfully"});

        
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
});

// return book to the store
router.put('/returnBook/:bookId', verifyToken, async(req, res) => {
    const studentId = req.id.id;
    try {
        const bookId = req.params.bookId;

        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(404).json({ message: "Book not found" });
        }

        const studentData = await Student.findById(studentId);
        if(!studentData) {
            return res.status(404).json({message: "Student not found"});
        }

        const bookData = await Store.findById(bookId);
        if(!bookData) {
            return res.status(404).json({message: "Book not found"});
        }

        // check if student has taken this book or not
        const bookIndex = studentData.books.findIndex(book => book.bookName.equals(bookId));
        console.log(bookIndex, "bookIndex");
        if(bookIndex === -1) {
            return res.status(404).json({message: "this book is not assigned to the student"});
        }

        // returning the book
        studentData.books.splice(bookIndex, 1);
        await studentData.save();
        bookData.quantity += 1;
        await bookData.save();

        sendMail(studentData.email, "Library Update", "Book returned successfully!");
        return res.status(200).json({message: "Book returned successfully"});

    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
});


// write review
router.put('/writeReview/:bookId', validateReq(writeReview), verifyToken, async(req, res) => {
    const studentId = req.id.id;
    const { review } = req.body;
    try {
        const bookId = req.params.bookId;

        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(404).json({ message: "Book not found" });
        }
        
        const studentData = await Student.findById(studentId);
        if(!studentData) {
            return res.status(404).json({message: "Student not found"});
        }

        const bookData = await Store.findById(bookId);
        if(!bookData) {
            return res.status(404).json({message: "Book not found"});
        }

        // check if student having that book or not
        const bookBorrow = studentData.books.some(book => book.bookName.equals(bookId));
        if(!bookBorrow) {
            return res.status(404).json({message: "you are not allowed to write the review"});
        }

        const newReview = {
            student: studentData._id,
            review: review,
            date: new Date()
        };

        bookData.reviews.push(newReview);
        await bookData.save();
        sendMail(studentData.email, "Library Update", "your book review recorded successfully");
        return res.status(404).json({message: "Review added for the book successfully!"});

    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
});

router.get('/getReviews/:bookId', verifyToken, async(req, res) => {
    const studentId = req.id.id;
    try {
        const bookId = req.params.bookId;
        if(!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(404).json({message: "book not found"});
        }

        const studentData = await Student.findById(studentId);
        console.log(studentData, "studentData");
        if(!studentData) {
            return res.status(404).json({message: "student not found"});
        }
        
        const bookData = await Store.findById(bookId);
        console.log(bookData, "bookData");
        if(!bookData) {
            return res.status(404).json({message: "book not found"});
        }

        const detail = bookData.reviews;
        const response = detail.map((data) => {
            return {
                review: data.review
            }
        });
        
        return res.status(200).json(response);


    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
});


module.exports = router;