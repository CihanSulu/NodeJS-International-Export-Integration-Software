const axios = require('axios')

const Tpage = async url =>{
    try{
        const categoryGet = await axios.get(url)
        const category = categoryGet.data.result
        const totalPage = Math.ceil(category.totalCount / 24)
        return totalPage

        
    }catch(e){console.log("Geçersiz kategori linki girildi")}
}



module.exports = Tpage