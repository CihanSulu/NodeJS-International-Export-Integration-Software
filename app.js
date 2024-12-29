const express = require('express')
const router = require('./routers/router')
const path = require('path')
const ejs = require('ejs')
const expressLayouts = require('express-ejs-layouts')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('./config/passport-config')
const authControl = require('./middlewares/authMiddle')
const agreementControl = require('./middlewares/agreementMiddle')
const stockFollow = require('./controllers/stockControl')
const crypto = require('crypto')
const cron = require('node-cron')
const app = express()




app.use(session({ cookie: { maxAge: 7200000}, secret: crypto.randomBytes(64).toString('hex'), resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.urlencoded())
app.use(express.json())
app.use(expressLayouts)
app.use(express.static(path.join(__dirname, 'public')))
app.use(flash()) 
app.use(function(req,res,next){
    res.locals.message = req.flash()
    next()
})
app.locals.formatDateTime = function (originalDate) {
  const date = new Date(originalDate);
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
    timeZone: 'Europe/Istanbul'
  };
  return new Intl.DateTimeFormat('tr-TR', options).format(date);
};
app.use(authControl)
app.use(agreementControl)
app.use(router)
app.set('view engine', 'ejs')
app.set('layout', 'views/layouts')

app.use((req, res, next) => {
  res.status(404).render('./errors/404',{layout:false})
})

// Her saat başında example.js dosyasını çalıştır
cron.schedule('0 */2 * * *', () => {
  stockFollow().then(() => {
    console.log("Stok takip başarıyla bitti");
  });
});



app.listen(80)