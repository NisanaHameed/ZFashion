const mongoose = require('mongoose');

const walletSchema = mongoose.Schema({
    UserId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    Balance:{
        type:Number,
        default:0
    },
    Transaction:[
        {
            Amount:{
                type:Number,
                default:0
            },
            Date:{
                type:Date,
            }
        }
    ]  
})

module.exports = mongoose.model('Wallet',walletSchema);