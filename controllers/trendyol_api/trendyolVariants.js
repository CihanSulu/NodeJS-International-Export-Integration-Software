const axios = require('axios')


const TvariantCheck = async groupID =>{
    try{
        const Tsingle = require('./trendyolSingle')
        let url = 'https://public.trendyol.com/discovery-web-websfxproductgroups-santral/api/v1/product-groups/'+groupID
        const variantsGet = await axios.get(url) 
        const variants = variantsGet.data.result.slicingAttributes[0].attributes
        return variants

    }catch(e){return 0}
}


module.exports = TvariantCheck