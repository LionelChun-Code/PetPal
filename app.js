const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require('dotenv').config();
const session = require("express-session");
const mongoose = require('mongoose');

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const petsRouter = require('./routes/pets');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 設定會話管理 Setup session management
app.use(session({
  secret: process.env.SECRETKEY, // 用於簽名會話 ID 的秘密字串 Secret string to sign session ID
  resave: false, // 禁止重新保存會話 Prevents resaving session
  saveUninitialized: false, // 不初始化未修改的會話 Prevents initializing unmodified sessions
  cookie: { secure: false }, // 設置 Cookie 為安全（僅限 HTTPS） Set cookie as secure (HTTPS only)
}));

// 設置本地變量 Setup local variables
app.use((req, res, next) => { 
  res.locals.baseUrl = req.protocol + '://' + req.get('host'); // 設定基本 URL Setup base URL
  res.locals.session = req.session; // 設定會話 Setup session
  next(); 
});

// 連接到 MongoDB 並設定本地資料庫 Connect to MongoDB and setup local database
const uri = process.env.MONGODB_URI;
mongoose.connect(uri).then(() => {
  console.log('Connected to MongoDB'); // 連接成功 Connected to MongoDB
  app.locals.db = mongoose.connection; // 在本地儲存連接 Store the connection in app.locals
}).catch(err => {
  console.error('Failed to connect to MongoDB', err); // 連接失敗 Failed to connect to MongoDB
});

// 當進程結束時關閉 MongoDB 連接 Close MongoDB connection on process termination
process.on('SIGINT', async () => {
  console.log("Closing MongoDB connection");
  await mongoose.connection.close();
  process.exit(0);
});

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/pets', petsRouter);

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// 捕獲 404 並轉發到錯誤處理器 
app.use(function(req, res, next) { 
  res.status(404).render('404', { title: 'Page Not Found' });
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
