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

const upload = multer({storage:storage}).fields([
    {name:'image1', maxCount: 1},
    {name:'image2', maxCount: 1},
    {name:'image3', maxCount: 1},
    {name:'image4', maxCount: 1},
]);

module.exports = upload;