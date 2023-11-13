const mongoose = require('mongoose');

const rateSchema = mongoose.Schema({
    
    ProductId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product',
        required:true
    },
    User:[
        {
            UserId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'User',
                required:true
            },
            Rating:{
                type:Number
            },
            Review:{
                type:String
            }
        }
    ],
    totalRating:{
        type:Number
    }
})

module.exports = mongoose.model('Rate',rateSchema);