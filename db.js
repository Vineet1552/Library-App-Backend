require('dotenv').config();
const mongoose = require('mongoose');
const DB_URL = process.env.DB_URL;

mongoose.connect(DB_URL);

const db = mongoose.connection;

db.on('connected', (req, res) => {
    console.log("DB connected Sucessfully!");
})

db.on('error', (req, res) => {
    console.log("error while connection with DB!");
})

db.on('disconnected', (req, res) => {
    console.log("DB disconnected successfully!");
})

module.exports = db;