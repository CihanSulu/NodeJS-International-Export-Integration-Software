const mongoose = require('../config/db')
const Schema = mongoose.Schema({
    userID:String,
    productID:Number,
    productCategory:Object,
    productName:String,
    productColor:String,
    productOzonColor:Number,
    productPrice:{
        discountedPrice:Number,
        sellingPrice:Number,
        originalPrice:Number
    },
    productAttributes:[Object],
    productOzonCategory:Object,
    productOzonAttributes:[Object],
    productAdvancedPrice:Object,
    productPacketInformation:Object,
    productDescription:String,
    productImages:[String],
    productImagesLocal:[String],
    productGender:{
        name:String,
        id:Number
    },
    productUrl:String,
    productFavoriteCount:Number,
    productGroupID:Number,
    productOtherMerchants:[Object],
    productAllVariants:[Object]
},{collection:'products',timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },_id:true})

const model = mongoose.model('products',Schema)

module.exports = model