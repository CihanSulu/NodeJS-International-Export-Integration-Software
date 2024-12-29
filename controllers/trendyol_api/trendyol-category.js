const axios = require('axios')
const Tmany = require('./trendyolMany')
const Tpage = require('./trendyolGetCategoryPage')

// Diziyi benzersiz yapmak için bir yardımcı fonksiyon
const uniqueArrayOfArrays = arr => {
    const uniqueArray = [];
    for (const subArray of arr) {
      const subArrayAsString = JSON.stringify(subArray);
  
      // Daha önce eklenmemişse, benzersiz diziye ekliyoruz
      if (!uniqueArray.includes(subArrayAsString)) {
        uniqueArray.push(subArrayAsString);
      }
    }
    return uniqueArray.map(subArrayAsString => JSON.parse(subArrayAsString));
}

const trendyolCategory = async (url,page) =>{
    try{
        url = 'https://public.trendyol.com/discovery-web-searchgw-service/v2/api/infinite-scroll/' + url.replace('https://www.trendyol.com/','')
        const totalPage = await Tpage(url)
        let totalProduct = []
        if(totalPage != undefined){
            for(let i=1;i<=totalPage;i++){
                const product = await Tmany(url,i)
                totalProduct = totalProduct.concat(product)
            }
        }
        totalProduct = await uniqueArrayOfArrays(totalProduct)

        return totalProduct

        
    }catch(e){console.log(e)}
}



module.exports = trendyolCategory