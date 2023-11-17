const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'../public/userImages/'));
    },
    filename:function(req,file,cb){
        const name = Date.now()+'-'+file.originalname;
        cb(null,name);
    }
});

const uploadProduct = multer({storage:storage}).fields([
    {name:'image1', maxCount: 1},
    {name:'image2', maxCount: 1},
    {name:'image3', maxCount: 1},
    {name:'image4', maxCount: 1},
]);

const storage2 = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'../public/bannerImages/'));
    },
    filename:function(req,file,cb){
        const name = Date.now()+'-'+file.originalname;
        cb(null,name);
    }
});

const uploadBanner = multer({storage:storage2}).single('image');

module.exports = {
    uploadProduct,
    uploadBanner
};