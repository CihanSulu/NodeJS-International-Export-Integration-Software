const axios = require('axios')
const trendyol = require('./trendyol')

const Tmany = async (url,page) =>{
    try{
        
        if (!url.match(/([&?])pi=\d+/)) {
            if (url.includes('?')) {
                url += '&pi='+page;
            } else {
                url += '?pi='+page;
            }
        } else {
            url = url.replace(/([&?])pi=\d+/g, '$1pi=' + page);
        }

        const categoryGet = await axios.get(url)
        const category = categoryGet.data.result
        const products = []
        for(productItem of category.products){
            const product = await trendyol('https://www.trendyol.com'+productItem.url)
            products.push(product)
        }
        
        return products
        
    }catch(e){console.log(e)}
}



module.exports = Tmany