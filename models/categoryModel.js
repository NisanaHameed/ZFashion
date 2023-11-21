const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    Offer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'CategoryOffer'
    }
});

module.exports = mongoose.model('Category',categorySchema);