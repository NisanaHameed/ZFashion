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
        Price:{
            type:Number,
            
        },
        Quantity:{
            type:Number,
            dafault:1,
            required:true
        },
        Totalprice:{
            type:Number,
            default:0
        },
        Size:{
            type:String
        }
    }
    ],
    totalAmount:{
        type:Number,
        default:0
    },
    isCoupon:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Coupon'
    }
})

module.exports = mongoose.model('Cart',cartSchema);