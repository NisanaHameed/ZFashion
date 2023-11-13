const mongoose = require("mongoose");

const admin = mongoose.Schema({
    Username:{
        type:String,
        required:true
    },
    email:{
        type:email,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    }
});

module.exports = mongoose.model('Admin',admin);