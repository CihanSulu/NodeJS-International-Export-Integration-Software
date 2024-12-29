const authControl = (req, res, next) => {
    // İstek URL'sini kontrol ederek '/' rotasında değilse isAuthenticated() yap
    if (req.url !== '/') {
        if (req.isAuthenticated()) {
            res.locals.user = req.user
            return next();
        }
        res.redirect('/');
    } else {
        return next();
    }
};

module.exports = authControl