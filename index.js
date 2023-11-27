const dotenv = require('dotenv').config();
var express = require('express');
var path = require('path');
const connectMongo = require('./config/mongodb');
const logger = require('morgan');
const error = require('./middleware/errorMiddleware');
const session = require('express-session');

var app = express();

connectMongo().then(()=>{ console.log('MongoDB connected'); });
const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>{
    console.log('server is running')
})

var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');

app.set('views',path.join(__dirname,'views/user'));
app.set('view engine','ejs');

app.use(session({
    secret: process.env.auth_secret,
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 6000000}
}));

app.use((req, res, next) => {
    res.header('cache-control', 'no-cache,no-store,must-revalidate');
    res.header('Expires', '0');
    next();
  });

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/',userRouter);
app.use('/admin',adminRouter);

app.use(error.notFoundMiddleware);
app.use(error.errorHandler);



