// storemodel.js
const express = require('express');
const { default: mongoose, mongo } = require('mongoose');

const storeSchema = new mongoose.Schema({
    bookName: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    reviews: [
        {
            student: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Student',
                required: true
            },
            review: {
                type: String
            },
            date: {
                type: Date,
                default: Date.now
            }
        }
    ]
});

const Store = mongoose.model('Store', storeSchema);
module.exports = Store;