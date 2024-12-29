const productModel = require('../models/productsModel')
const logModel     = require('../models/stockLogsModel')
const usersModel     = require('../models/usersModel')
const trendyol     = require('../controllers/trendyol_api/trendyol')


const sortedArray = (array1,array2)=>{
    let array1ItemNumbers = array1.map(item => item.itemNumber);
    let sortedArray2 = array2.sort((a, b) => {
        return array1ItemNumbers.indexOf(a.itemNumber) - array1ItemNumbers.indexOf(b.itemNumber);
    });
    return sortedArray2;
}

const onlyUnique = (value, index, array)=>{
    return array.indexOf(value) === index;
}

const logSave = async(id,logText,variantArray,globalUserID)=>{
    try{
        if(variantArray == undefined){
            let newLog = new logModel()
            newLog.userID = globalUserID
            newLog.product_ID = id
            newLog.log        = logText
            await newLog.save()
          }
          else{
            if(variantArray[1] != undefined){
              let newLog = new logModel()
              newLog.userID = globalUserID
              newLog.product_ID = id
              newLog.itemNumber = variantArray[0]
              newLog.itemType   = "price"
              newLog.itemOldValue = variantArray[1]
              newLog.log        = logText
              await newLog.save()
            }
            if(variantArray[2] != undefined){
              let newLog = new logModel()
              newLog.userID = globalUserID
              newLog.product_ID = id
              newLog.itemNumber = variantArray[0]
              newLog.itemType   = "stock"
              newLog.itemOldValue = variantArray[2]
              newLog.log        = logText
              await newLog.save()
            }
            if(variantArray[1] == undefined && variantArray[2] == undefined){
              let newLog = new logModel()
              newLog.userID = globalUserID
              newLog.product_ID = id
              newLog.itemNumber = variantArray[0]
              newLog.itemType   = "new"
              newLog.log        = logText
              await newLog.save()
            }
        }
    }
    catch(err){
        console.log("Stok Logda Hata Yaşandı.")
    }
}

const stockFollow = async()=>{

    let users = await usersModel.find({}, { userID: 1 });
    for(let k = 0; k<users.length; k++){
        let userID = users[k]._id.toString()

        let groups   = []
        let products = await productModel.find({userID})
        products.forEach(item=>{
            groups.push(item.productGroupID)
        })
        groups = groups.filter(onlyUnique);
        groups = groups.filter(item => item !== undefined && item !== null)

        //Group Foru
        for(let i = 0;i<groups.length;i++){
            let groupID = groups[i]
            let product = await productModel.find({productGroupID:groupID})
            let trendProduct = await trendyol("https://trendyol.com"+product[0].productUrl)
    
    
            /*Ürün Grubuna Fazladan Ürün Eklendiyse*/
            await trendProduct.map(async function(item){
                let control = 0
                product.forEach(myProduct=>{
                    if(myProduct.productID == item.productID)
                        control = 1;
                })
                if(control == 0){
                    let newProduct = new productModel()
                    newProduct.userID = userID
                    newProduct.productID = item.productID
                    newProduct.productCategory = 0
                    newProduct.productName = item.name
                    newProduct.productColor = item.color
                    newProduct.productPrice = item.price
                    newProduct.productAttributes = item.attributes
                    newProduct.productDescription = item.description
                    newProduct.productImages = item.images
                    newProduct.productGender = item.gender
                    newProduct.productUrl = item.url
                    newProduct.productFavoriteCount = item.favoriteCount
                    newProduct.productGroupID = item.groupID
                    newProduct.productOtherMerchants = item.otherMerchants
                    newProduct.productAllVariants = item.allVariants
                    newProduct.save().then(() => {
                        logSave(item.groupID,"Ürün Grubunda Olmayan Yeni Ürün Başarıyla Eklendi.",[item.productID,undefined,undefined],userID)
                        console.log("Ürün Grubunda Olmayan Yeni Ürün Başarıyla Eklendi.")
                    })
                    .catch((error) => {
                        console.error("Ürün Grubunda Olmayan Yeni Ürün Eklenemedi.")
                    })
                }
            })

            /*Ürün Grubundan Ürün Çıkarıldıysa*/
            await product.map(async function(item){
                let control = 0
                trendProduct.forEach(trProduct=>{
                    if(trProduct.productID == item.productID)
                        control = 1;
                })
                if(control == 0){
                    await productModel.deleteOne({ _id: item._id }).then(function(){
                        logSave(item.productGroupID,"Ürün Grubundan Silinen Ürün Panelden Başarıyla Silindi.",undefined,userID)
                        console.log("Ürün Grubundan Silinen Ürün Panelden Başarıyla Silindi.")
                    }).catch(function(error){
                        console.log("Ürün Grubundan Silinen Ürün Panelden Silinemedi.")
                    });
                }
            })


            //Varyanta Yeni Varyant Eklendiyse
            await trendProduct.map(async function(item){
                for(let i = 0; i<product.length;i++){
                    if(product[i].productID == item.productID){
                        //Ürünler Eşleşti
                        item.allVariants.map(async function(itemT){
                            control = 0
                            for(let j = 0;j<product[i].productAllVariants.length;j++){
                                if(product[i].productAllVariants[j].itemNumber == itemT.itemNumber){
                                    control = 1
                                    break; // Eğer eşleşme bulunduysa döngüden çık
                                }
                            }
                            if(control == 0){
                                product[i].productAllVariants.push(itemT)
                                product[i].productAllVariants = sortedArray(item.allVariants,product[i].productAllVariants)
                                await productModel.findOneAndUpdate({_id:product[i]._id}, {productAllVariants:product[i].productAllVariants}).then(function(){
                                    logSave(product[i].productGroupID,"Üründe Olmayan Yeni Varyant Başarıyla Eklendi.",[itemT.itemNumber,undefined,undefined],userID)
                                    console.log("Üründe Olmayan Yeni Varyant Başarıyla Eklendi.")
                                }).catch(function(error){
                                    console.log("Üründed Olmayan Yeni Varyant Eklenemedi.")
                                });
                            }
                        })
                    }
                }
            })


            //Varyantan Bir Varyant Silindiyse
            await trendProduct.map(async function(item){
                for(let i = 0; i<product.length;i++){
                    if(product[i].productID == item.productID){
                        //Ürünler Eşleşti
                        product[i].productAllVariants.map(async function(itemP){
                            control = 0
                            for (let j = 0; j < trendProduct[i].allVariants.length; j++) {
                                if (itemP.itemNumber && item.allVariants[j] && itemP.itemNumber === item.allVariants[j].itemNumber) {
                                    control = 1;
                                    break; // Eğer eşleşme bulunduysa döngüden çık
                                }
                            }
                            if(control == 0){
                                let updatedProductAllVariants = product[i].productAllVariants.filter(item => item.itemNumber !== itemP.itemNumber)
                                updatedProductAllVariants = sortedArray(item.allVariants,updatedProductAllVariants)
                                await productModel.findOneAndUpdate({_id:product[i]._id}, {productAllVariants:updatedProductAllVariants}).then(function(){
                                    logSave(product[i].productGroupID,"Üründen Kaldırılan Varyant Başarıyla Kaldırıldı.",undefined,userID)
                                    console.log("Üründen Kaldırılan Varyant Başarıyla Kaldırıldı.")
                                }).catch(function(error){
                                    console.log("Üründen Kaldırılan Varyant Kaldırılamadı.")
                                });
                            }
                        })
                    }
                }
            })


            //Varyant Check
            await product.map(async function(itemP){
                for(let i = 0; i<trendProduct.length;i++){
                    if(itemP.productID == trendProduct[i].productID){
                        //Ürünler Eşleşti
                        itemP.productAllVariants.map(async function(itemV){
                            for(let j = 0;j<trendProduct[i].allVariants.length;j++){
                                let changeStock = undefined
                                let changePrice = undefined
                                let changeVariantCount = false
                                if(itemV.itemNumber == trendProduct[i].allVariants[j].itemNumber){
                                    if(itemV.inStock != trendProduct[i].allVariants[j].inStock){
                                        changeStock = await itemV.inStock
                                        itemV.inStock = await trendProduct[i].allVariants[j].inStock
                                        changeVariantCount = await true
                                    }
                                    if(itemV.price != trendProduct[i].allVariants[j].price){
                                        changePrice = await itemV.price
                                        itemV.price   = await trendProduct[i].allVariants[j].price
                                        changeVariantCount = await true
                                    }
                                    if(changeVariantCount == true){
                                        itemP.productAllVariants = sortedArray(trendProduct[i].allVariants,itemP.productAllVariants)
                                        await productModel.findOneAndUpdate({_id:itemP._id}, {productAllVariants:itemP.productAllVariants}).then(function(){
                                            logSave(itemP.productGroupID,"Ürünün Varyantı Güncellendi.",[itemV.itemNumber,changePrice,changeStock],userID)
                                            console.log("Ürünün Varyantı Başarıyla Güncellendi.")
                                        }).catch(function(error){
                                            console.log("Ürünün Varyantı Güncellenemedi.")
                                        });
                                    }
                                }
                            }
                        })
                    }
                }
            })

            //Update Other Merchants






        }
    }
}



/*stockFollow().then(() => {
  console.log("Stok takip başarıyla bitti");
});*/
module.exports = stockFollow