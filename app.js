const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const expressSession = require("express-session")
const flash  = require("connect-flash");
const passport = require("passport");
const userModel = require("./models/userModel")
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const db = require("./config/mongoose-connection");

const app = express();

require("dotenv").config();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressSession({
  resave : false,
  saveUninitialized : false,
  secret : process.env.EXPRESS_SESSION_KEY,
}))
app.use(flash());

app.use(function (req, res, next) {
  res.locals.succes = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

app.use(passport.initialize())
app.use(passport.session())
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
