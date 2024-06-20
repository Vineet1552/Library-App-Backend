// jwt.js
require('dotenv').config();
const jwt = require('jsonwebtoken');

const generateToken = (studentData) => {
    return jwt.sign(studentData, process.env.JWT_SECRET, {expiresIn: 4000});
}

const verifyToken = (req, res, next) => {
    // extract token from the header
    const token = req.headers.authorization.split(' ')[1];
    if(!token) {
        return res.status(404).json({message: "Token not found!"});
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.id = decoded;
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Invalid token"});
    }
};

module.exports = {
    generateToken,
    verifyToken
}