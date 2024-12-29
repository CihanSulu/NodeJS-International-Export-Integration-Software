const axios = require('axios')

const exchange = async _ =>{
    try{
        const apiUrl = 'http://api.bigpara.hurriyet.com.tr/doviz/headerlist/anasayfa';
        const exchangeGet = await axios.get(apiUrl)
        const data = exchangeGet.data.data
        const usdtryData = data.find(item => item.SEMBOL === "USDTRY");
        return usdtryData["ALIS"]

        
    }catch(e){return e}
}

module.exports = exchange