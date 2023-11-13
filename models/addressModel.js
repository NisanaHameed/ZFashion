const mongoose = require('mongoose');

const addressSchema = mongoose.Schema({
    UserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    Address: [{
        Name: {
            type: String,
            required: true
        },
        State: {
            type: String,
            required: true
        },
        HouseName: {
            type: String,
            required: true
        },
        City: {
            type: String,
            required: true
        },
        Locality: {
            type: String,
            required: true
        },
        Mobile:{
            type:Number,
            required:true
        },
        Pincode: {
            type: Number,
            required: true
        }
    }]
})
module.exports = mongoose.model('Address', addressSchema);