const express = require('express');
const mongoose = require('mongoose');

const mongo = () =>{ return mongoose.connect(process.env.mongo, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
};
module.exports = mongo;