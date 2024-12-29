const trendyol = require('./trendyol_api/trendyol')
const trendyolCategory = require('./trendyol_api/trendyol-category')
const productModel = require('../models/productsModel')
const stockModel   = require('../models/stockLogsModel')
const translate    = require('./productTranslate')
const exchange     = require('./usdTryExchange')
const mongoose = require('mongoose')

const products = async(req,res)=>{
    try{

        let groupProduct = []
        let listProducts = []
        let products = await productModel.find({userID:req.user.id})
        products.forEach(item=>{
            if (groupProduct.indexOf(item.productGroupID) === -1)
                groupProduct.push(item.productGroupID)
        })
        await Promise.all(groupProduct.map(async item => {
            let findOne = await productModel.findOne({ userID:req.user.id, productGroupID: item }).exec();
            let logControl = await stockModel.find({userID:req.user.id, product_ID:item})
            if(logControl.length > 0)
                findOne.productLogControl = true
            listProducts.push(findOne);
        }));

        listProducts = listProducts.reverse() //order by desc
        res.render('products',{layout: './layouts/index',listProducts})
        
    }catch(e){
        console.log(e)
        req.flash('msg',{'type':'error','message':'Sistemsel hata yaşandı lütfen daha sonra tekrar deneyin.'})
        res.redirect('/products')
    }
}


const newProduct = (req,res)=>{
    res.render('new-product',{layout: './layouts/index'})
}


const newProductMany = (req,res)=>{
    res.render('new-product-many',{layout: './layouts/index'})
}


const newProductPost = async (req,res)=>{
    try{

        let dailyLimitControl = await getDailyProductLength(req.user.id)
        let totalLimitControl = await getTotalProductLength(req.user.id)

        if(totalLimitControl >= req.user.limit){
            req.flash('msg', {'type': 'error', 'message': 'Hesabınıza tanımlı toplam ürün yükleme hakkınız tükenmiştir.'})
            return res.redirect('new')
        }
        else if(dailyLimitControl >= req.user.dailyLimit){
            req.flash('msg', {'type': 'error', 'message': 'Hesabınıza tanımlı günlük ürün yükleme hakkınız tükenmiştir.'})
            return res.redirect('new')
        }

        const url = req.body.url
        const product = await trendyol(url)
        if(product == false)
            req.flash('msg',{'type':'error','message':'Ürün linki geçersiz veya kaldırılmış.'})
        else{
            let findProduct = await productModel.find({userID:req.user.id,productGroupID:product[0].groupID})
            if(findProduct.length>0){
                req.flash('msg',{'type':'error','message':'Bu ürün grubu daha önce sisteme eklenmiş.'})
            }
            else{
                product.forEach(element=>{
                    let product = new productModel()
                    product.userID = req.user.id
                    product.productID = element.productID
                    product.productCategory = element.category
                    product.productName = element.name
                    product.productColor = element.color
                    product.productPrice = element.price
                    product.productAttributes = element.attributes
                    product.productDescription = element.description
                    product.productImages = element.images
                    product.productImagesLocal = element.imagesLocal
                    product.productGender = element.gender
                    product.productUrl = element.url
                    product.productFavoriteCount = element.favoriteCount
                    product.productGroupID = element.groupID
                    product.productOtherMerchants = element.otherMerchants
                    product.productAllVariants = element.allVariants
                    product.save()
                })
                req.flash('msg',{'type':'success','message':'Ürün başarıyla platformdan çekildi.'})
            }
        }
        
        res.redirect('new')


    }catch(e){
        req.flash('msg',{'type':'error','message':'Sistemsel hata yaşandı lütfen daha sonra tekrar deneyin.'})
        res.redirect('/products')
    }
}


const newProductManyPost = async (req,res)=>{
    try{

        let dailyLimitControl = await getDailyProductLength(req.user.id)
        let totalLimitControl = await getTotalProductLength(req.user.id)

        if(totalLimitControl >= req.user.limit){
            req.flash('msg', {'type': 'error', 'message': 'Hesabınıza tanımlı toplam ürün yükleme hakkınız tükenmiştir.'})
            return res.redirect('new-many')
        }
        else if(dailyLimitControl >= req.user.dailyLimit){
            req.flash('msg', {'type': 'error', 'message': 'Hesabınıza tanımlı günlük ürün yükleme hakkınız tükenmiştir.'})
            return res.redirect('new-many')
        }
        
        let trendyolManyCount = 0
        let trendyolManyStop = false
        const url = req.body.url
        const many = await trendyolCategory(encodeURI(url))
        if(many.length == 0)
            req.flash('msg',{'type':'error','message':'Kategori linki geçersiz veya kaldırılmış.'})
        else{
            for(const i of many){
                let findProduct = await productModel.find({userID:req.user.id,productGroupID:i[0].groupID})
                if(findProduct.length==0){

                    if(trendyolManyCount == req.user.trendyolManyLimit){
                        trendyolManyStop = true
                        break
                    }else{

                        if(await getTotalProductLength(req.user.id) >= req.user.limit){
                            req.flash('msg', {'type': 'success', 'message': 'Hesabınıza tanımlı toplam ürün yükleme hakkınız kadar ürün başarıyla platformdan çekildi.'})
                            return res.redirect('new-many')
                        }
                        else if(await getDailyProductLength(req.user.id) >= req.user.dailyLimit){
                            req.flash('msg', {'type': 'success', 'message': 'Hesabınıza tanımlı günlük ürün yükleme hakkınız kadar ürün başarıyla platformdan çekildi.'})
                            return res.redirect('new-many')
                        }

                        i.forEach(element=>{
                            let product = new productModel()
                            product.userID = req.user.id
                            product.productID = element.productID
                            product.productCategory = element.category
                            product.productName = element.name
                            product.productColor = element.color
                            product.productPrice = element.price
                            product.productAttributes = element.attributes
                            product.productDescription = element.description
                            product.productImages = element.images
                            product.productImagesLocal = element.imagesLocal
                            product.productGender = element.gender
                            product.productUrl = element.url
                            product.productFavoriteCount = element.favoriteCount
                            product.productGroupID = element.groupID
                            product.productOtherMerchants = element.otherMerchants
                            product.productAllVariants = element.allVariants
                            product.save()
                        })
                        trendyolManyCount = trendyolManyCount + 1

                    }

                    
                }
            }

            if(!trendyolManyStop)
                req.flash('msg',{'type':'success','message':'Ürünler başarıyla platformdan çekildi.'})
            else
                req.flash('msg',{'type':'success','message':'Ürünler, ' + req.user.trendyolManyLimit.toString() + ' ürüne kadar başarıyla platformdan çekildi.'})
        }

        res.redirect('new-many')


    }catch(e){
        req.flash('msg',{'type':'error','message':'Sistemsel hata yaşandı lütfen daha sonra tekrar deneyin.'})
        res.redirect('/products')
    }
}


const productDetail = async(req,res)=>{
    try{

        let id = req.params.id
        if (!isNaN(id)) {
            let product = await productModel.find({userID:req.user.id, productGroupID:id})
            if(product.length == 0){
                req.flash('msg',{'type':'error','message':'Ürün kaldırılmış veya değiştirilmiş.'})
                res.redirect('/products')
            }
            else{
                await translate(product) //Translate API
                let nowUsd = await exchange() //Exchange
                let stockWarning = await stockModel.find({userID:req.user.id, product_ID:id})
                let advancedPrice = {
                    'platform':15,
                    'weight':100,
                    'profit':0
                }
                let packetInformation = {
                    'depth':"",
                    'width':"",
                    'height':""
                }
                let ozonCategories = {
                    'categoryID':0,
                    'typeID':0,
                    'categoryString':""
                }
                let OzonAttributes = ""
                //Find Advanced Price
                product.map(function(item){
                    if(item.productAdvancedPrice != undefined){
                        advancedPrice.platform = item.productAdvancedPrice.platform
                        advancedPrice.weight   = item.productAdvancedPrice.weight
                        advancedPrice.profit   = item.productAdvancedPrice.profit
                        return true
                    }
                })

                //Get Ozon Categories
                product.map(function(item){
                    if(item.productOzonCategory != undefined){
                        ozonCategories.categoryID = item.productOzonCategory.categoryID
                        ozonCategories.typeID   = item.productOzonCategory.typeID
                        ozonCategories.categoryString   = item.productOzonCategory.categoryString
                        return true
                    }
                })

                //Get Ozon Attribute    
                product.map(function(item){
                    if(item.productOzonAttributes != undefined){
                        OzonAttributes = item.productOzonAttributes
                        return true
                    }
                })

                //Get Ozon Attribute For Variant
                let OzonAttributeVariants = []
                product.map(function(item){
                    if(item.productOzonAttributes != undefined){
                        item.productOzonAttributes.forEach(att=>{
                            if(att.id == 4298 || att.id == 4295){
                                OzonAttributeVariants = att.values
                                return true
                            }
                        })
                    }
                })

                //Get Packet Information    
                product.map(function(item){
                    if(item.productPacketInformation != undefined){
                        packetInformation.depth = item.productPacketInformation.depth
                        packetInformation.width   = item.productPacketInformation.width
                        packetInformation.height   = item.productPacketInformation.height
                        return true
                    }
                })
                

                res.render('product-single',{layout: './layouts/index',product,stockWarning,nowUsd,advancedPrice,packetInformation,ozonCategories,OzonAttributes,OzonAttributeVariants})
            }
        }
        else
            res.redirect('/404')

    }catch(e){
        console.log(e)
        req.flash('msg',{'type':'error','message':'Sistemsel hata yaşandı lütfen daha sonra tekrar deneyin.'})
        res.redirect('/products')
    }
}


const productVariantDelete = async(req,res)=>{
    try{

        let group = req.params.group
        let key   = req.params.key
        let product = await productModel.find({userID:req.user.id, productGroupID:group})
        if(product.length != 0 && (product && product.length > 0 && product[key] && product[key]._id)){
            let id = product[key]._id
            await productModel.deleteOne({ userID:req.user.id, _id: id }).then(async function(){
                if(product.length == 1)
                    await stockModel.deleteMany({ userID:req.user.id, product_ID: group })
                req.flash('msg',{'type':'success','message':'Varyant başarıyla silindi.'})
            }).catch(function(error){
                req.flash('msg',{'type':'error','message':'Varyant silinirken bir hata yaşandı lütfen daha sonra tekrar deneyin.'})
            });
            res.redirect('/products/'+group)
        }
        else{
            req.flash('msg',{'type':'error','message':'Ürün kaldırılmış veya değiştirilmiş.'})
            res.redirect('/products')
        }

    }catch(e){
        console.log(e)
        req.flash('msg',{'type':'error','message':'Sistemsel hata yaşandı lütfen daha sonra tekrar deneyin.'})
        res.redirect('/products')
    }
}


const productDelete = async(req,res)=>{
    try{
        let group = req.params.group
        await productModel.deleteMany({ userID:req.user.id, productGroupID: group }).then(async function(){
            await stockModel.deleteMany({ userID:req.user.id, product_ID: group })
            req.flash('msg',{'type':'success','message':'Ürün grubu başarıyla silindi.'})
        }).catch(function(error){
            req.flash('msg',{'type':'error','message':'Ürün grubu silinirken bir hata yaşandı lütfen daha sonra tekrar deneyin.'})
        });
        res.redirect('/products')

    }catch(e){
        console.log(e)
        req.flash('msg',{'type':'error','message':'Sistemsel hata yaşandı lütfen daha sonra tekrar deneyin.'})
        res.redirect('/products')
    } 
}

const productDeleteMany = async(req,res)=>{
    try{
        req.body.ids = req.body.ids.split(',')
        for(let i = 0;i<req.body.ids.length; i++){
            let id = req.body.ids[i]
            await productModel.deleteMany({ userID:req.user.id, productGroupID: id }).then(async function(){
                await stockModel.deleteMany({ userID:req.user.id, product_ID: id })
                req.flash('msg',{'type':'success','message':'Ürünler başarıyla silindi.'})
            }).catch(function(error){
                req.flash('msg',{'type':'error','message':'Ürünler silinirken bir hata yaşandı lütfen daha sonra tekrar deneyin.'})
            });
        }
        res.redirect('/products')

    }catch(e){
        console.log(e)
        req.flash('msg',{'type':'error','message':'Sistemsel hata yaşandı lütfen daha sonra tekrar deneyin.'})
        res.redirect('/products')
    }
}


const productDeleteImage = async(req,res)=>{
    try{

        let id  = req.params.id
        let key = req.params.key
        if (!mongoose.Types.ObjectId.isValid(id)) {
            req.flash('msg',{'type':'error','message':'Ürün kaldırılmış veya değiştirilmiş.'})
            res.redirect('/products')
        }
        else{
            let product = await productModel.findOne({userID:req.user.id, _id:id})
            let group = product.productGroupID
            let images = product.productImages
            let imagesLocal = product.productImagesLocal //Upload Images
            images.splice(key, 1);
            imagesLocal.splice(key, 1);
            product.productImages = images
            product.productImagesLocal = imagesLocal
            await product.save().then(function(){
                req.flash('msg',{'type':'success','message':'Ürün fotoğrafı başarıyla silindi.'})
            }).catch(function(error){
                req.flash('msg',{'type':'error','message':'Ürün fotoğrafı silinirken bir hata yaşandı lütfen daha sonra tekrar deneyin.'})
            });
            res.redirect('/products/'+group)
        }


    }catch(e){
        console.log(e)
        req.flash('msg',{'type':'error','message':'Sistemsel hata yaşandı lütfen daha sonra tekrar deneyin.'})
        res.redirect('/products')
    }
}


const productStockFollowing = async(req,res)=>{
    try{
        
        let logs = await stockModel.find({userID:req.user.id})
        
        // product_ID'ye göre gruplama
        const groupedData = logs.reduce((acc, item) => {
            const existingItem = acc.find(groupedItem => groupedItem.product_ID === item.product_ID);
            if (existingItem) {
            existingItem.log.push(item.log);
            } else {
            acc.push({
                _id: item._id,
                product_ID: item.product_ID,
                log: [item.log],
                created_at: item.created_at,
                updated_at: item.updated_at,
                __v: item.__v
            });
            }
        
            return acc;
        }, []);
        for(let i = 0;i<groupedData.length;i++){
            let imageArray = await productModel.findOne({userID:req.user.id, productGroupID:groupedData[i].product_ID})
            let image1 = imageArray.productImages[0]
            let image2 = imageArray.productImages[1]
            groupedData[i].productName = imageArray.productName
            groupedData[i].images = [
                image1
            ]
            if(image2 != undefined)
                groupedData[i].images.push(image2)
        }
        res.render('product-stock',{layout: './layouts/index',groupedData})


    }catch(e){
        console.log(e)
        req.flash('msg',{'type':'error','message':'Sistemsel hata yaşandı lütfen daha sonra tekrar deneyin.'})
        res.redirect('/products')
    }
}


const productStockDelete = async (req,res)=>{
    try{

        let group = req.params.group
        await stockModel.deleteMany({ userID:req.user.id, product_ID: group }).then(async function(){
            req.flash('msg',{'type':'success','message':'Stok takip kaydı başarıyla silindi.'})
        }).catch(function(error){
            req.flash('msg',{'type':'error','message':'Stok takip kaydı silinirken bir hata yaşandı lütfen daha sonra tekrar deneyin.'})
        });
        res.redirect('/products/following')


    }catch(e){
        console.log(e)
        req.flash('msg',{'type':'error','message':'Sistemsel hata yaşandı lütfen daha sonra tekrar deneyin.'})
        res.redirect('/products')
    }
}


const productUpdate = async(req,res)=>{
    try{

        let group    = req.params.id
        let body     = req.body
        let advancedPrice = {
            'platform':body['advanced-platform'],
            'weight':body['advanced-weight'],
            'profit':body['advanced-profit']
        }
        let packetInformation = {
            'depth':body['depth'],
            'width':body['width'],
            'height':body['height']
        }
        

        let setAttributes  = body.attributes
        let getAttributes;
        if(setAttributes != undefined){
            const OzonAttributes = require('./ozon_api/ozonProduct')
            getAttributes = await OzonAttributes.getAttribute(req,res,body.typeID)
            if(getAttributes != 0){
                for(let i = 0; i<getAttributes.length;i++){
                    getAttributes[i].value = setAttributes[i]
                }
            }
        }
        
        let products = await productModel.find({userID:req.user.id, productGroupID:group})
        for(let i = 0;i<products.length;i++){
            let control = false
            let updateJson = [
                {productName:body.productName[i]},
                {productDescription:body.productDescriptions[i]},
                {productOzonCategory:{'categoryID':body.categoryID,'typeID':body.typeID,'categoryString':body.categoryString}},
            ]

            if(setAttributes != undefined)
                updateJson.push({productOzonAttributes:getAttributes})
                

            updateJson.push({productAdvancedPrice:advancedPrice})
            updateJson.push({productPacketInformation:packetInformation})

            if (body.productColor && Array.isArray(body.productColor)) 
                updateJson.push({productOzonColor:body.productColor[i]})


            if(body['productStockValue-'+(i)] != undefined){
                products[i].productAllVariants.map(function(item,key){
                    item.ozonValue = body['productStockValue-'+(i)][key]
                })
                control = true
            }

            if(body['productStockPrice-'+(i)] != undefined){
                products[i].productAllVariants.map(function(item,key){
                    item.newPrice = parseFloat(body['productStockPrice-'+(i)][key].replace(',', '.'))
                })
                control = true
            }
            if(control == true)
                updateJson.push({productAllVariants:products[i].productAllVariants})


            let resultJson = Object.assign({}, ...updateJson)

            await productModel.findOneAndUpdate({userID:req.user.id, _id:products[i]._id},resultJson)
                
                
        }

        req.flash('msg',{'type':'success','message':'Ürün başarıyla güncellendi.'})
        res.redirect('/products/'+group)


    }catch(e){
        console.log(e)
        req.flash('msg',{'type':'error','message':'Sistemsel hata yaşandı lütfen daha sonra tekrar deneyin.'})
        res.redirect('/products')
    } 
}

const getTotalProductLength = async(userID)=>{
    try{
        let productGruoupIds = await productModel.find({'userID': userID}).select('productGroupID')
        let uniqueArrayGroup = productGruoupIds.reduce((accumulator, currentItem) => {
            if (!accumulator.find(item => item.productGroupID === currentItem.productGroupID)) {
                accumulator.push(currentItem);
            }
            return accumulator;
        }, []);
        return uniqueArrayGroup.length
    }catch(e){
        console.log(e)
        return 0
    }
}

const getDailyProductLength = async(userID) =>{
    try{
        const todayDate = new Date()
        todayDate.setHours(0, 0, 0, 0)
        const tomorrowDate = new Date(todayDate)
        tomorrowDate.setDate(todayDate.getDate() + 1)

        const productGruoupIds = await productModel
            .find({
                'userID': userID,
                'created_at': {
                    $gte: todayDate,
                    $lt: tomorrowDate
                }
            })
            .select('productGroupID');
        
        let uniqueArrayGroup = productGruoupIds.reduce((accumulator, currentItem) => {
                if (!accumulator.find(item => item.productGroupID === currentItem.productGroupID)) {
                    accumulator.push(currentItem);
                }
                return accumulator;
        }, []);

        return uniqueArrayGroup.length

    }catch(e){
        console.log(e)
        return 0
    }
}

/*const UpdatePrice9999 = async(req,res)=>{
    await stockModel.deleteMany({})
    let products = await productModel.find()
    for(let i = 0;i<products.length;i++){
        for(let j = 0; j<products[i].productAllVariants.length;j++){
            products[i].productAllVariants[j].price = 9999
        }
        await productModel.findOneAndUpdate({productID:products[i].productID}, {productAllVariants:products[i].productAllVariants})
    }
    res.send("bitti")

}*/


module.exports = {
    products,newProduct,newProductPost,productDetail,newProductMany,newProductManyPost,productVariantDelete,productDelete,productDeleteMany,productDeleteImage,productStockFollowing,productStockDelete,productUpdate
}