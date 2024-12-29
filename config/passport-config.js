const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const userModel   = require('../models/usersModel')
const bcrypt = require('bcrypt');

passport.use(new LocalStrategy(
    async function(username, password, done) {

        /*bcrypt.hash(password, 10, function(err, hash) {
            if (err) {
                console.error('Hash oluşturma hatası:', err);
            } else {
                console.log('Hash:', hash);
            }
        });*/

        const user = await userModel.findOne({"user_info.user_email":username})
        if (user) {
            bcrypt.compare(password, user.user_info.user_password, function(err, result) {
                if (err)
                    return done(null, false);
                else {
                    if (result === true)
                        return done(null,user)
                    else
                        return done(null, false);
                }
            });
        } else
            return done(null, false);
            
    }
));

// Kullanıcı bilgilerini oturumda depolamak için serialize ve deserialize fonksiyonları
passport.serializeUser(function(user, done) {
    let loginUser = {
        'id':user._id.toString(),
        'profile':user.user_info.user_name + " " + user.user_info.user_surname,
        'admin':user.user_admin,
        'limit':user.user_limit.product_limit,
        'dailyLimit':user.user_limit.daily_limit,
        'trendyolManyLimit':50
    }
    done(null, loginUser);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

module.exports = passport;