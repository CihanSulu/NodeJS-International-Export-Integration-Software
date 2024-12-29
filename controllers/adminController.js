/* Admin Controller */
const passport = require('passport');
const usersModel    = require('../models/usersModel')
const productModel = require('../models/productsModel')
const stockModel   = require('../models/stockLogsModel')
const bcrypt = require('bcrypt');

const adminUsers = async(req,res)=>{
    let users = await usersModel.find({})
    res.render('admin/users',{layout: './layouts/index',users})
}

const adminNewUser = (req,res)=>{
    res.render('admin/newUser',{layout: './layouts/index'})
}

const adminNewUserForm = async(req,res)=>{
    findUser = await usersModel.findOne({ 'user_info.user_email': req.body.email })
    if(findUser != null)
        req.flash('msg', { 'type': 'error', 'message': 'Email adresiyle üyelik bulunmaktadır.' })
    else{

        let parts = req.body.expiration.split('-')
        let formattedDate = parts[2] + '.' + parts[1] + '.' + parts[0]
        req.body.expiration = formattedDate

        // Yeni Şifreyi Kayıt Et
        const hash = await new Promise((resolve, reject) => {
            bcrypt.hash(req.body.password, 10, function(err, hash) {
                if (err) {
                    reject(err); // Hata durumunda reject çağır
                } else {
                    resolve(hash); // Başarılı olduğunda hash'i resolve çağır
                }
            });
        });

        let newUser = new usersModel({
            'user_info':{
                'user_name':req.body.name,
                'user_surname':req.body.surname,
                'user_email':req.body.email,
                'user_phone':req.body.phone,
                'user_password':hash
            },
            'user_limit':{'product_limit':req.body.limit,'daily_limit':req.body.dailyLimit},
            'user_admin':(req.body.admin === 'true'),
            'user_expirationDate':req.body.expiration
        })
        await newUser.save()
            .then(() => req.flash('msg',{'type':'success','message':'Kullanıcı başarıyla oluşturuldu.'}))
            .catch(err => req.flash('msg', { 'type': 'error', 'message': 'Kullanıcı oluşturulurken hata yaşandı.' }))
    }

    res.redirect("/admin/users/new")
}

const adminViewUser = async(req,res)=>{
    try{
        let thisUser = await usersModel.findOne({'_id':req.params.id})
        res.render('admin/user-detail',{layout: './layouts/index',thisUser})
    }catch(e){
        console.log(e)
        res.redirect('/admin/users')
    }
}

const adminViewUserForm = async(req,res)=>{
    try{
        let user = await usersModel.findOne({'_id':req.params.id})
        let parts = req.body.expiration.split('-')
        let formattedDate = parts[2] + '.' + parts[1] + '.' + parts[0]
        req.body.expiration = formattedDate

        user.user_info.user_name = req.body.name
        user.user_info.user_surname = req.body.surname
        user.user_info.user_email = req.body.email
        user.user_info.user_phone = req.body.phone
        user.user_limit.product_limit = req.body.limit
        user.user_limit.daily_limit = req.body.dailyLimit
        user.user_admin = (req.body.admin === 'true')
        user.user_expirationDate = req.body.expiration


        if(req.body.password != ""){
            // Yeni Şifreyi Kayıt Et
            const hash = await new Promise((resolve, reject) => {
                bcrypt.hash(req.body.password, 10, function(err, hash) {
                    if (err) {
                        reject(err); // Hata durumunda reject çağır
                    } else {
                        resolve(hash); // Başarılı olduğunda hash'i resolve çağır
                    }
                });
            });
            user.user_info.user_password = hash
        }

        await usersModel.updateOne({'_id':req.params.id}, user)
            .then(result => {
                req.flash('msg',{'type':'success','message':'Kullanıcı başarıyla güncellendi.'})
            })
            .catch(error => {
                req.flash('msg', { 'type': 'error', 'message': 'Günceleme gerçekleşirken hata yaşandı.' })
            });


        res.redirect('/admin/users/'+req.params.id)

    }catch(e){
        req.flash('msg', { 'type': 'error', 'message': 'Sistemsel hata yaşandı lütfen daha sonra tekrar deneyin.' })
        res.redirect('/admin/users')
    }
}

const adminUserDelete = async(req,res)=>{
    try{

        if(req.params.id == req.user.id){
            req.flash('msg', { 'type': 'error', 'message': 'Kullanıcı kendi hesabını silemez.' })
        }
        else{

            await usersModel.deleteOne({'_id':req.params.id})
                .then(result => {
                    req.flash('msg',{'type':'success','message':'Kullanıcı başarıyla silindi.'})
                })
                .catch(error => {
                    req.flash('msg', { 'type': 'error', 'message': 'Silme işlemi gerçekleşirken hata yaşandı.' })
                });

            //Kullanıcıya ait verileri temizle
            await productModel.deleteMany({ 'userID': req.params.id });
            await stockModel.deleteMany({ 'userID': req.params.id });

            

        }
        
        res.redirect('/admin/users/')
        
    }catch(e){
        console.log(e)
        req.flash('msg', { 'type': 'error', 'message': 'Sistemsel hata yaşandı lütfen daha sonra tekrar deneyin.' })
        res.redirect('/admin/users')
    }
}


module.exports = {
    adminUsers,adminNewUser,adminNewUserForm,adminViewUser,adminViewUserForm,adminUserDelete
}