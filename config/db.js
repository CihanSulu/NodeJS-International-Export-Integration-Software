const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/truva')

module.exports = mongoose