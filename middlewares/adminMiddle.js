const usersModel = require('../models/usersModel')

const adminControl = async (req, res, next) => {
    try {
        let user = await usersModel.findOne({ '_id': req.user.id })
        if (!user) {
            res.status(404).redirect('/')
        } else {
            if (user.user_admin === false) {
                res.status(403).redirect('/dashboard')
            } else {
                next();
            }
        }
    } catch (error) {
        next(error); // Hata durumunda hatayı middleware zincirine iletiyoruz
    }
};

module.exports = adminControl;