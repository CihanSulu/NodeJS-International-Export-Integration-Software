const Tsingle = require('./trendyolSingle')
const Tvariants = require('./trendyolVariants')

const trendyol = async url =>{
    try{
        const product = await Tsingle(url)
        const variants = await Tvariants(product[0].groupID)

        if(variants == 0)
            return product
        else{
            const variantArray = []
            for(const element of variants){
                const productVariant = await Tsingle('https://trendyol.com/'+element.contents[0].url)
                variantArray.push(productVariant[0])
            }
            return variantArray
        }
        
    }catch(e){return false}
}


module.exports = trendyol