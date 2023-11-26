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
    },
    Products:[{
        ProductId:{
            type:String,           
            ref:'Product'
        },
        Quantity:{
            type:Number,
            dafault:1,
            required:true
        },
        Size:{
            type:String
        }
    }
    ],
    isCoupon:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Coupon'
    }
});

module.exports = mongoose.model('User',user);