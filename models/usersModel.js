const mongoose = require('../config/db')
const Schema = mongoose.Schema({
    user_info:{
        user_name:String,
        user_surname:String,
        user_email:String,
        user_phone:String,
        user_password:String
    },
    user_limit:{
        product_limit:Number,
        daily_limit:Number
    },
    user_api: {
        type: Object, 
        default: {}
    },
    user_admin:Boolean,
    user_agreement:{
        type: Boolean, 
        default: false
    },
    user_agreementDate:{
        type: String, 
        default: ""
    },
    user_expirationDate:String
},{minimize: false,collection:'users',timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },_id:true})

const model = mongoose.model('users',Schema)

module.exports = model