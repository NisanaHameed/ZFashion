var express = require('express'); 
const router = express();

router.set('view engine', 'ejs');
router.set('views','./views/admin');

const adminController = require('../controllers/adminController');
const productController = require('../controllers/productController')
const categoryController = require('../controllers/categoryController');
const orderController = require('../controllers/orderController');
const couponController = require('../controllers/couponController');
const bannerController = require('../controllers/bannerController');
const offerController = require('../controllers/offerController');
const categoryOfferController = require('../controllers/categoryOfferController');
const {adminAuth, userAuth} = require('../middleware/authMiddleware');
const multerMiddleware = require('../middleware/multerMiddleware');

router.get('/login',adminController.loadLogin);
router.post('/Loginadmin',adminController.registerLogin)
router.get('/',adminAuth,adminController.loadDashboard);

router.get('/Users',adminAuth,adminController.loadUsers);
router.get('/blockUser/:id',adminController.blockUser);

router.get('/products',adminAuth,productController.loadProducts);
router.get('/loadAddproduct',adminAuth,productController.loadaddProduct);
router.post('/add-product',multerMiddleware.uploadProduct,productController.addProduct);
router.get('/delete-product/:id',productController.deleteProduct);
router.get('/updateProduct/:id',productController.loadUpdateProduct);
router.post('/update-product/:id',multerMiddleware.uploadProduct,productController.updateProduct);
router.get('/productSearch',productController.productsearch);

router.get('/category',adminAuth,categoryController.loadCategory);
router.post('/add-category',categoryController.addCategory);
router.get('/delete-category/:id',categoryController.deleteCategory);
router.post('/update-category/:id',categoryController.updateCategory);

router.get('/orders',adminAuth,orderController.getAdminOrders);
router.get('/orderDetails/:id',orderController.adminOrderDetails);
router.get('/cancelOrder/:id',orderController.adminCancelOrder);
router.get('/changeStatus',orderController.adminchangeStatus);

router.get('/coupon',adminAuth,couponController.getAdminCoupon);
router.get('/loadAddcoupon',adminAuth,couponController.getAddCoupon);
router.post('/addCoupon',couponController.addCoupon);
router.get('/getEditCoupon/:id',adminAuth,couponController.getEditCoupon);
router.post('/editCoupon/:id',couponController.editCoupon);
router.get('/blockCoupon/:id',adminAuth,couponController.blockCoupon);
router.delete('/deleteCoupon/:id',couponController.deleteCoupon);

router.get('/banner',adminAuth,bannerController.getBanner);
router.get('/loadAddBanner',adminAuth,bannerController.loadAddbanner);
router.post('/addBanner',multerMiddleware.uploadBanner,bannerController.addBanner);
router.delete('/deleteBanner/:id',bannerController.deleteBanner);

router.get('/offer',adminAuth,offerController.getOffer);
router.get('/loadAddOffer',adminAuth,offerController.loadAddOffer);
router.post('/addOffer',offerController.addOffer);
router.get('/blockOffer/:id',adminAuth,offerController.blockOffer);
router.get('/getEditOffer/:id',adminAuth,offerController.getEditOffer);
router.post('/editOffer/:id',offerController.editOffer);

router.get('/categoryOffer',adminAuth,categoryOfferController.loadCategoryOffer);
router.get('/loadAddCategoryOffer',adminAuth,categoryOfferController.loadAddCategoryOffer);
router.post('/addCategoryOffer',categoryOfferController.addCategoryOffer);
router.get('/getEditCategoryOffer/:id',adminAuth,categoryOfferController.getEditCategoryOffer);
router.post('/editCategoryOffer/:id',categoryOfferController.editCategoryOffer);
router.get('/blockCategoryOffer/:id',adminAuth,categoryOfferController.blockCategoryOffer);

router.get('/salesReport',adminAuth,adminController.getSalesReport);
// router.get('/downloadSalesReport',adminAuth,adminController.downloadSalesReport);

router.get('/logout',adminController.adminLogout);



module.exports = router;