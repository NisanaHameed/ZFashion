const mongoose = require('mongoose');

const wishlistSchema = mongoose.Schema({
    UserId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    Products:[
        {
            ProductId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
            }
        }       
    ]
})

module.exports = mongoose.model('Wishlist',wishlistSchema);