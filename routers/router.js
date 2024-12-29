const router = require('express').Router()
const dashboardController = require('../controllers/dashboardController')
const productController = require('../controllers/productController')
const ozonController = require('../controllers/ozon_api/ozonProduct')
const adminController = require('../controllers/adminController')
let adminMiddleware  = require('../middlewares/adminMiddle')

//General
router.get('/',dashboardController.login)
router.post('/',dashboardController.mainForm)
router.get('/dashboard',dashboardController.main)
router.get('/exit',dashboardController.exit)
router.get('/products',productController.products)
router.get('/products/new',productController.newProduct)
router.post('/products/new',productController.newProductPost)
router.get('/products/new-many',productController.newProductMany)
router.post('/products/new-many',productController.newProductManyPost)
router.get('/products/deleteProduct/:group',productController.productDelete)
router.post('/products/deleteManyProduct',productController.productDeleteMany)
router.get('/products/deleteVariant/:group/:key',productController.productVariantDelete)
router.get('/products/deleteImage/:id/:key',productController.productDeleteImage)
router.get('/products/following/',productController.productStockFollowing)
router.get('/products/logDelete/:group',productController.productStockDelete)


//Users
router.get('/account',dashboardController.accountInfo)
router.get('/change-password',dashboardController.changePassword)
router.post('/change-password',dashboardController.changePasswordForm)
router.get('/api',dashboardController.myApis)
router.get('/api/ozon',dashboardController.myOzonApi)
router.post('/api/ozon',dashboardController.myOzonApiForm)
router.get('/agreement',dashboardController.agreement)
router.post('/agreement',dashboardController.agreementForm)


//Admin
router.get('/admin/users',adminMiddleware,adminController.adminUsers)
router.get('/admin/users/new',adminMiddleware,adminController.adminNewUser)
router.post('/admin/users/new',adminMiddleware,adminController.adminNewUserForm)
router.get('/admin/users/:id',adminMiddleware,adminController.adminViewUser)
router.post('/admin/users/:id',adminMiddleware,adminController.adminViewUserForm)
router.get('/admin/users/delete/:id',adminMiddleware,adminController.adminUserDelete)


//Ozon API
router.post('/getAttribute',ozonController.getAttribute)
router.post('/sendProduct',ozonController.sendProduct)


//Product View
router.get('/products/:id',productController.productDetail)
router.post('/products/:id',productController.productUpdate)

module.exports = router