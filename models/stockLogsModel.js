const mongoose = require('../config/db')
const Schema = mongoose.Schema({
    userID:String,
    product_ID:Number,
    itemNumber:Number,
    itemType:String,
    itemOldValue:String,
    log:String
},{collection:'stockLogs',timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },_id:true})

const model = mongoose.model('stockLogs',Schema)

module.exports = model