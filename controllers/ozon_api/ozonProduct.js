const axios = require('axios')
const productModel = require('../../models/productsModel')
const usersModel   = require('../../models/usersModel')
const productTranslate = require('../OzonTranslate')


//OZON API
const getOzonData = async(userID) => {
  let client = ""
  let apiKey = ""
  let user = await usersModel.findOne({'_id':userID})
  if (user && user.user_api && user.user_api.ozon) {
    client = user.user_api.ozon.client
    apiKey = user.user_api.ozon.apiKey
  }
  return {client,apiKey}
}



const getAttribute = async(req,res,type)=>{
  try{
    let client, apiKey
    ({ client, apiKey } = await getOzonData(req.user.id))

    url = 'https://api-seller.ozon.ru/v3/category/attribute'
    let body = req.body

    if (typeof type != 'function')
      body.category_id = type


    const headers = {
      'Client-Id': client,
      'Api-Key': apiKey
    };
    const data = {
      "attribute_type":"ALL",
      "category_id": [parseInt(body.category_id)],
      "language": "TR"
    };
    try{
      const attribute = await axios.post(url, data, { headers })
      const filteredAttributes = attribute.data.result[0].attributes.filter(item => item.dictionary_id !== 0 && item.id !== 9461)

      for (let i = 0; i < filteredAttributes.length; i++) {
        let item = filteredAttributes[i]
        let values = await attributeValues(body.category_id, item.id, [client, apiKey])
        if (values !== 0) {
          item.values = values
        }
      }

      if (typeof type == 'function')
        res.send(attribute.data.result[0].attributes)
      else
        return attribute.data.result[0].attributes
    }
    catch(error){
      if (error.response && error.response.data && error.response.data.message) 
        if (typeof type == 'function')
          res.send({'msg':error.response.data.message})
        else
          return 0
      else 
        if (typeof type == 'function')
          res.send({'msg':'Sistemsel hata yaşandı lütfen daha sonra tekrar deneyin.'})
        else
          return 0
    }

    
    
  }catch(e){console.log(e)}
}

let attributeValues = async(categoryID,attributeID,getApiKey)=>{

  try{
    let client, apiKey
    client = getApiKey[0]
    apiKey = getApiKey[1]

    url = 'https://api-seller.ozon.ru/v2/category/attribute/values'


    const headers = {
      'Client-Id': client,
      'Api-Key': apiKey
    };
    const data = {
      "category_id": categoryID,
      "attribute_id": attributeID,
      "limit": 5000,
      "language": "TR"
    };
    try{
      const attributeValues = await axios.post(url, data, { headers })
      return attributeValues.data.result
    }
    catch(error){
      if (error.response && error.response.data && error.response.data.message) 
          return 0
      else 
          return 0
    }

    
    
  }catch(e){console.log(e)}

}

const attributeReplace = async(attributes,id,value)=>{
  if(!attributes.find(item => item.id === id)){
    attributes.push({ "id": id, "values": [ { "value": value } ] })
  }
  else{
    for (let i = 0; i < attributes.length; i++) {
      if (attributes[i].id === id) {
        attributes[i].values[0].value = value;
        break;
      }
    }
  }
  return attributes
}

const attributeVariantReplace = async(attributes,ozonValue)=>{
  if(attributes.find(item => item.id === 4298) || attributes.find(item => item.id === 4295)){
    if(ozonValue != undefined && ozonValue != ""){
      for (let i = 0; i < attributes.length; i++) {
        if (attributes[i].id === 4298 || attributes[i].id === 4295) {
          attributes[i].values[0].dictionary_value_id = ozonValue
          break;
        }
      }
    }
  }
  return attributes
}



const sendProduct = async(req,res,next)=>{
  try{

    let client, apiKey
    ({ client, apiKey } = await getOzonData(req.user.id))

    let products = await productModel.find({userID:req.user.id,productGroupID:req.body.groupID})
    let categoryControl = false
    let attributeControl = false

    products.forEach(item=>{
      if(item.productOzonCategory == undefined || item.productOzonCategory.typeID == "0"){
        categoryControl = true
        return true
      }

      if(item.productOzonAttributes == undefined || item.productOzonAttributes.length == 0){
        categoryControl = true
        return true
      }
    })

    if(categoryControl){
      res.send({'message':'Ürün kategorisi veya özellikleri seçilmemiş.'})
    }
    else{
      products.forEach(item=>{
        item.productOzonAttributes.forEach(attribute=>{
          if(attribute.is_required == true && attribute.value == ""){
            attributeControl = true
            return true
          }
        })
      })
      
      if(attributeControl){
        res.send({'message':'Ürün özellikleri içinde zorunlu alanlar doldurulmalı.'})
      }
      else{
        //POST PRODUCT OZON


        let getUser = await usersModel.findOne({'_id':req.user.id})
        let wareHouse = getUser.user_api.ozon.warehouse
        let OzonAttributes = ""   
        let attributes = []
        let stocks = []
        let items = []
        products.map(function(item){
          if(item.productOzonAttributes != undefined){
              OzonAttributes = item.productOzonAttributes
              return true
          }
        })

        OzonAttributes.forEach(att=>{
          if(att.value != "" || (att.name == "Ürün rengi" && att.id == 10096) ){
            let values = []

            if(att.values == undefined){
              values.push(
                {"value":att.value}
              )
            }
            else{
              values.push(
                {"dictionary_value_id":att.value}
              )
            }

            attributes.push({
                "id": att.id,
                "values": values
            })
          }
        })

        let i = 99
        for (let j = 0; j < products.length; j++) {
            product = products[j];

            product.productName = await productTranslate(product.productName);
            product.productDescription = await productTranslate(product.productDescription);
        
            /* Replace Color */
            await Promise.all(attributes.map(async item => {
                if (item.id == 10096) {
                    if (product.productOzonColor != undefined)
                        item.values[0].dictionary_value_id = product.productOzonColor;
                }
            }));

            //Card Plus
            let cardMerge = attributes.find(item => item.id === 9048)
            if(!cardMerge){
              attributes.push({ "id": 9048, "values": [ { "value": "card"+product.productGroupID.toString() } ] })
            }

            //Description
            attributes = await attributeReplace(attributes,4191,product.productDescription)
        
        
            //Variants
            for(let t = 0;t<product.productAllVariants.length;t++){
              variant = product.productAllVariants[t]
              let price        = variant.newPrice
              let variantValue = variant.value
              let stock        = variant.inStock
              let stockCount   = 0
              if(stock)
                stockCount = 50

              if(variantValue != ""){
                //Üretici Boyutu Start
                attributes = await attributeReplace(attributes,9533,variantValue)
                
                //Variant Change
                attributes = await attributeVariantReplace(attributes,variant.ozonValue)
              }


              let newAttributes = JSON.parse(JSON.stringify(attributes));
              i++;
          
              /*let productImages = [];
              product.productImages.forEach(image => {
                  productImages.push("https://cdn.dsmcdn.com/" + image);
              });*/
          
              items.push({
                  "attributes": newAttributes,
                  "barcode": i.toString() + product.productGroupID.toString(),
                  "category_id": parseInt(product.productOzonCategory.typeID),
                  "color_image": product.productImagesLocal[0],
                  "complex_attributes": [],
                  "currency_code": "USD",
                  "depth": product.productPacketInformation.depth,
                  "dimension_unit": "mm",
                  "height": product.productPacketInformation.height,
                  "images": product.productImagesLocal,
                  "name": product.productName,
                  "offer_id": i.toString() + product.productGroupID.toString(),
                  "old_price": (price+(price*35/100)).toFixed(2).toString(),
                  "premium_price": price.toString(),
                  "price": price.toString(),
                  "vat": "0",
                  "weight": product.productAdvancedPrice.weight,
                  "weight_unit": "g",
                  "width": product.productPacketInformation.width
              })

              stocks.push({"offer_id":i.toString() + product.productGroupID.toString(),"stock":stockCount,"warehouse_id":wareHouse})

            }

            
        }


        /*items.forEach(item=>{
          //console.log(item)
          item.attributes.forEach(item2=>{
            console.log(item2)
            return true
          })
        })*/

        url = 'https://api-seller.ozon.ru/v2/product/import'
        const headers = {
          'Client-Id': client,
          'Api-Key': apiKey
        }
        const data = {
          "items": items
        }
        const sendPost = await axios.post(url, data, { headers })

        //Info Product
        url = 'https://api-seller.ozon.ru/v1/product/import/info' 
        let pending = true;
        do {
            const infoProduct = await axios.post(url, {"task_id": sendPost.data.result.task_id}, { headers });
            let infoResult = infoProduct.data.result.items;
            for (let i = 0; i < infoResult.length; i++) {
                if (infoResult[i].status === "pending") {
                    pending = false
                    break
                }
            }
        } while (pending);

        //WareHouse
        url = 'https://api-seller.ozon.ru/v2/products/stocks'
        const sendWareHouse = await axios.post(url, {"stocks": stocks}, { headers })

        //console.log(sendWareHouse.data.result)
        console.log(sendPost.data.result)
        res.send(sendPost.data.result)


        //POST PRODUCT OZON
      }


    }


  }catch(e){
    console.log(e)
    res.send(e.response.data)
  }
}


module.exports = {
  getAttribute,sendProduct
}