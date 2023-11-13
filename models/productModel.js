const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    product_name:{
        type:String,
        required:true
    },
    Price:{
        type:Number,
        required:true
    },
    Size:{
        type:[String],
        required:true
    },
    Productdetails:{
        type:String,
        required:true
    },
    Image:{
        image1:{
            type:String,
            required:true
        },
        image2:{
            type:String,
            required:true
        },
        image3:{
            type:String,
            required:true
        },
        image4:{
            type:String,
            required:true
        }
    },
    Color:{
        type:String,
        required:true
    },
    Category:{
        type:String,
        // ref:'Category',
        required:true
    },
    Brand:{
        type:String,
        required:true
    },
    Stock:{
        type:Number,
        required:true
    }
});

module.exports = mongoose.model('Product',productSchema);