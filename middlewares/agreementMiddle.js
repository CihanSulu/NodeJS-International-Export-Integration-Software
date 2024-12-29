const usersModel = require('../models/usersModel')

const agreementControl = async (req, res, next) => {
    try {
        if (req.url !== '/' && req.url !== '/agreement' && req.url !== '/exit') {
            let user = await usersModel.findOne({ '_id': req.user.id })
            if (!user) {
                res.status(404).redirect('/')
            } else {
                if (user.user_agreement !== true) {
                    req.flash('msg',{'type':'success','message':'Sistemi kullanmanız için sözleşmenin okunup onaylanması gerekmektedir.'})
                    res.redirect('/agreement')
                } else {
                    next();
                }
            }
        }
        else{
            next()
        }
    } catch (error) {
        next(error); // Hata durumunda hatayı middleware zincirine iletiyoruz
    }
};

module.exports = agreementControl;