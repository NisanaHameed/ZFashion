var express = require('express'); 
const router = express();
const {userAuth} = require('../middleware/authMiddleware');

router.set('view engine', 'ejs');
router.set('views','./views/user');

const userController = require('../controllers/userController');
const cartController = require('../controllers/cartController');
const orderController = require('../controllers/orderController');
const addressController = require('../controllers/addressController')
const wishlistController = require('../controllers/wishlistController');
const couponController = require('../controllers/couponController');
const productController = require('../controllers/productController');
const rateController = require('../controllers/rateController');
const walletController = require('../controllers/walletController');

router.get('/signup',userController.loadSignup);
router.post('/registerUser',userController.sentotp);

router.post('/verifyotp',userController.verifyotp);
router.get('/resendOTP',userController.resendOTP);

router.get('/login',userController.loadLogin);
router.post('/LoginUser',userController.login);
router.get('/getforgotPassword',userController.getforgotPassword);
router.post('/forgotPassword',userController.forgotPassword);

router.get('/',userController.home);
router.get('/shop',userController.loadShop);
router.get('/productDetail/:id',userController.loadProductdDetail);
router.get('/shopCategory/:id',userController.loadCategoryShop);
// router.get('/shopBrand/:id',userController.loadBrandShop);

router.get('/cart',userAuth,cartController.loadCart);
router.post('/addtocart',cartController.addCart);
router.post('/removecartItem',cartController.removeCartItem);
router.post('/updatecartQuantity',cartController.updateQuantity);

router.get('/get-Checkout',userAuth,orderController.getCheckOut);
router.post('/submitcheckout',orderController.checkOut);
router.get('/OrderAddress',userAuth,addressController.loadOrderAddress);
router.post('/addOrderAddress',addressController.addOrderAddress);

router.get('/profile',userAuth,userController.getProfile);
router.post('/editProfile',userController.editUserProfile);
router.post('/editVerifyOTP',userController.editVerifyOtp);

router.post('/changeUserPassword',userController.changePassword);

router.get('/address',userAuth,addressController.getAddress);
router.get('/addAddress',userAuth,addressController.getaddAddress);
router.post('/addNewAddress',addressController.add_newaddress);
router.delete('/deleteAddress',userAuth,addressController.deleteAddress);
router.post('/editAddress/:id',addressController.editAddress);

router.get('/orders',userAuth,orderController.getOrdersUser);
router.get('/order-Detail/:order',orderController.getOrderDetails);
router.post('/cancellOrder',orderController.cancelOrder);
router.post('/verifyOrder',orderController.verifyOrder);
router.get('/returnProduct/:id',orderController.returnProduct);
router.post('/submitReturnProduct/:id',orderController.submitReturnProduct);
router.get('/orderSuccess',orderController.orderSuccess);

router.get('/wishlist',userAuth,wishlistController.getWishlist);
router.post('/addWishlist',wishlistController.addWishList);
router.post('/movetocart',wishlistController.moveToCart);
router.put('/removeWishlistItem',wishlistController.removeItem);

router.get('/coupons',userAuth,couponController.getUserCoupon);
router.post('/applyCoupon',couponController.applyCoupon);
router.put('/removeCoupon',userAuth,couponController.removeCoupon);

router.get('/wallet',userAuth,walletController.getWallet);

router.post('/productRating',rateController.productRating);
router.post('/submitProductReview',rateController.submitproductReview);

router.get('/contact',userController.getContact);

router.get('/logOut',userAuth,userController.logout);

module.exports = router;