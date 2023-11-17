const mongoose = require('mongoose');

const user = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    mobile:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        default:"user"
    },
    isBlock:{
        type:Boolean,
        dafault:false
    },
    referralCode:{
        type:String
    }
});

module.exports = mongoose.model('User',user);