const productModel = require('../models/productsModel')
const stockModel   = require('../models/stockLogsModel')
const usersModel    = require('../models/usersModel')
const mongoose = require('mongoose')
const passport = require('../config/passport-config')
const bcrypt = require('bcrypt');

const login = (req,res)=>{
    if (req.isAuthenticated()) {
        res.redirect('/dashboard');
    } else {
        res.render('login',{layout:false})
    }
}

const mainForm = function(req, res, next) {
    passport.authenticate('local', function(err, user) {
        if (err) {
            return next(err);
        }
        if (!user) { //Kullanıcı bulunamazsa
            req.flash('msg',{'type':'error','message':'Kullanıcı adı veya şifre hatalı.'})
            res.redirect("/");
        } else { //Kullanıcı bulunduysa
            if(getExpirationDate(user.user_expirationDate)){ //Kullanıcının son kullanım tarihi geçmiş mi
                req.login(user, function(err) { //Her şey tamamsa login yap
                    if (err) {
                        return next(err);
                    }
                    req.flash('msg',{'type':'success','message':'Giriş başarıyla yapıldı.'})
                    res.redirect("/dashboard");
                });
            }
            else{ //Kullanıcının son kullanma tarihi geçtiyse
                req.flash('msg',{'type':'error','message':'Uygulamayı kullanım süreniz bitmiştir. Lütfen tekrar kullanmak için iletişime geçin'})
                res.redirect("/");
            }
        }
    })(req, res, next);
};

const main = async (req,res)=>{
    let groupProduct = []
    let listProducts = []
    let products = await productModel.find({userID:req.user.id}).sort({created_at: -1})
    let totalProductsCount = products.length
    let stocks   = await stockModel.find({userID:req.user.id}).sort({created_at: -1})
    let totalStocksCount = stocks.length;
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
    let listProductsCount = listProducts.length


    let groupedData = stocks.reduce((acc, item) => {
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
        if(imageArray != null){
            let image1 = imageArray.productImages[0]
            let image2 = imageArray.productImages[1]
            groupedData[i].productName = imageArray.productName
            groupedData[i].images = [
                image1
            ]
            if(image2 != undefined)
                groupedData[i].images.push(image2)
        }
        else{
            groupedData.splice(i, 1)
            i--
        }
    }

    let stockGroupCount = groupedData.length

    listProducts = listProducts.slice(0,5)
    groupedData  = groupedData.slice(0,5) 
    

    res.render('main',{layout: './layouts/index',totalStocksCount,stockGroupCount,totalProductsCount,listProductsCount,listProducts,groupedData})
}

const exit = (req,res)=>{
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
}

const getExpirationDate = (getDate) => {
    var bugun = new Date();
    bugun.setHours(0, 0, 0, 0); // Saat bilgisini sıfırla
    
    // Verilen tarihi ayrıştır ve yeni bir tarih nesnesine dönüştür
    var tarihParcalari = getDate.split(".");
    var verilenTarihObjesi = new Date(tarihParcalari[2], tarihParcalari[1] - 1, tarihParcalari[0]);
    
    // Tarihleri karşılaştır
    if (verilenTarihObjesi < bugun) {
        return false;
    } else if (verilenTarihObjesi.toDateString() === bugun.toDateString()) {
        return true; // Aynı gün
    } else {
        return true;
    }
}

const remainingDate = (getDate) => {
    // Bugünün tarihini al
    var bugun = new Date();

    // Hedef tarihi oluştur (gün, ay, yıl olarak parçalıyoruz)
    var parcalar = getDate.split(".");
    var hedefTarih = new Date(parcalar[2], parcalar[1] - 1, parcalar[0]);

    // Gün farkını hesapla
    var difference = Math.ceil((hedefTarih - bugun) / (1000 * 60 * 60 * 24));

    return difference;
}

const accountInfo = async(req,res)=>{
    let user = await usersModel.findOne({'_id':req.user.id})
    let user_info = user.user_info
    let user_limit = user.user_limit.product_limit
    let user_daily_limit = user.user_limit.daily_limit
    let remainingDay = remainingDate(user.user_expirationDate)
    res.render('account-info',{layout: './layouts/index',user_info,user_limit,remainingDay,user_daily_limit})
}

const changePassword = async(req,res)=>{
    res.render('account-change-password',{layout: './layouts/index'})
}

const changePasswordForm = async(req, res) => {
    let passwordOld = req.body['password-ol'];
    let passwordNew = req.body['password-new'];
    let user = await usersModel.findOne({ '_id': req.user.id });

    bcrypt.compare(passwordOld, user.user_info.user_password, async function(err, result) {
        if (result === true) {
            try {
                // Şifre Eşleşti Yeni Şifreyi Kayıt Et
                const hash = await new Promise((resolve, reject) => {
                    bcrypt.hash(passwordNew, 10, function(err, hash) {
                        if (err) {
                            reject(err); // Hata durumunda reject çağır
                        } else {
                            resolve(hash); // Başarılı olduğunda hash'i resolve çağır
                        }
                    });
                });

                // Veritabanına Kaydet
                await usersModel.updateOne({ '_id': req.user.id }, { "user_info.user_password": hash });
                req.flash('msg',{'type':'success','message':'Hesabınızın şifresi başarıyla değiştirildi.'})
                res.redirect('/change-password');
            } catch (error) {
                req.flash('msg', { 'type': 'error', 'message': 'Şifre değiştirirken sistem hata yaşandı.' });
                res.redirect('/change-password');
            }
        } else {
            req.flash('msg', { 'type': 'error', 'message': 'Mevcut şifre hatalı veya eksik girildi.' });
            res.redirect('/change-password');
        }
    });
}

const myApis = (req,res)=>{
    res.render('account-api',{layout: './layouts/index'})
}

const myOzonApi = async(req,res)=>{

    let ozonData = {
        'platform':'Ozon',
        'client':'',
        'apiKey':'',
        'warehouse':''
    }

    let user = await usersModel.findOne({'_id':req.user.id})
    if(user.user_api.ozon != undefined){
        ozonData.client = user.user_api.ozon.client
        ozonData.apiKey = user.user_api.ozon.apiKey
        ozonData.warehouse = user.user_api.ozon.warehouse
    }

    res.render('account-api-ozon',{layout: './layouts/index',ozonData})
}

const myOzonApiForm = async(req,res)=>{
    let ozonData = {
        'platform':'Ozon',
        'client':'',
        'apiKey':'',
        'warehouse':''
    }

    ozonData.client = req.body.client
    ozonData.apiKey = req.body.apiKey
    ozonData.warehouse = req.body.warehouse

    await usersModel.updateOne({ '_id': req.user.id }, { "user_api.ozon": ozonData })
    req.flash('msg',{'type':'success','message':'Api bilgileri başarıyla güncellendi.'})
    res.redirect('/api/ozon');
}

const agreement = async(req,res)=>{
    try{
        let divClass = false
        let agreementDate = ""
        let user = await usersModel.findOne({'_id':req.user.id})
        if(user.user_agreement == true){
            divClass = true
            agreementDate = user.user_agreementDate
        }
            
        res.render('agreement',{layout: './layouts/index',divClass,agreementDate})
    }catch(e){}
}

const agreementForm = async(req,res)=>{
    try{
        
        const now = new Date(); // Şu anki tarih ve saat bilgisini al
        const options = { 
            timeZone: 'Europe/Istanbul', 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        };
        const istanbulTime = now.toLocaleString('tr-TR', options);

        if(req.body.agreement == "on"){
            await usersModel.updateOne({ '_id': req.user.id }, {
                user_agreement: true,
                user_agreementDate: istanbulTime
            })
            .then((result) => {
                req.flash('msg',{'type':'success','message':'Sözleşme başarıyla onaylandı.'})
            })
            .catch((error) => {
                req.flash('msg',{'type':'error','message':'Sözleşme onaylanırken hata yaşandı lütfen daha sonra tekrar deneyin.'})
            });
            res.redirect("/dashboard")
        }
        else
            res.redirect("/agreement")

    }catch(e){
        req.flash('msg',{'type':'error','message':'Sistemsel hata yaşandı lütfen daha sonra tekrar deneyin.'})
        res.redirect("/agreement")
    }
    
}


module.exports = {
    login,main,mainForm,exit,accountInfo,changePassword,changePasswordForm,myApis,myOzonApi,myOzonApiForm,agreement,agreementForm
}