const Tsku = async url =>{
  try{
    let c = -1
    let sku = ""
    for(let i=0;i<url.length;i++){
      if(url[i-1] == '-' && url[i] == 'p' && url[i+1] == '-')
        c = i+2;
      if(i == c && Number.isInteger(parseInt(url[i]))){
        sku += url[i];
        c++;
      }
    }

    return sku
    
  }catch(e){return e}
}

module.exports = Tsku