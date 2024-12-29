const axios = require('axios')
const Tsku = require('./trendyolSku')
const Tvariants = require('./trendyolVariants')
const uploadImages = require('../uploadImages')

const Tsingle = async url =>{
  try{
    url = 'https://public.trendyol.com/discovery-web-productgw-service/api/productDetail/'+ await Tsku(url)+'?linearVariants=true'
    const productGet = await axios.get(url)
    const product = productGet.data.result
    const groupID = ''
    const data = []
    let color = undefined
    /*product.attributes.forEach(i => {
      if(i.key && i.key.name == "Renk")
        color = i.value.name
    });*/
    if(product.color != null)
      color = product.color

    /* Trendyol Güncenceleme 1 */
    if(product.allVariants.length == 0){
      product.allVariants = product.merchantListings[0].allVariants
      product.allVariants[0]["currency"] = "TRY"
      product.allVariants[0]["barcode"] = product.merchantListings[0].variants[0].barcode
      product.allVariants[0]["price"] = product.price.discountedPrice.value
    }
     
    data.push({
      productID:product.id,
      name:product.name,
      color:color,
      price:{
         discountedPrice:product.price.discountedPrice.value,
         sellingPrice:product.price.sellingPrice.value,
         originalPrice:product.price.originalPrice.value
      },
      attributes:product.attributes,
      description:product.descriptions.map(function (item) {
        if (item.priority == 0)
          return item.text+"<br><br>"
        else
          return ""
      }).join(""),
      images:product.images,
      imagesLocal:await uploadImages(product.images,product.productGroupId.toString()+"_"+product.id.toString()), //Upload Images
      gender:product.gender,
      category:product.originalCategory,
      url:product.url,
      favoriteCount:product.favoriteCount,
      groupID: product.productGroupId,
      otherMerchants:product.otherMerchants,
      allVariants:product.allVariants
    })
    
    
    return data
    
    
  }catch(e){return e}
}

module.exports = Tsingle