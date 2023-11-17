const mongoose = require('mongoose');

const cartSchema = mongoose.Schema({
    UserId:{
        type:String,
        required:true,
        ref:'User'
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
})

module.exports = mongoose.model('Cart',cartSchema);