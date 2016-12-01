var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
//因为涉及到发表文章，所以这里加一个articles路由
var articles = require('./routes/articles');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var flash = require('connect-flash');

var app = express();
app.set('env',process.env.ENV);
var config = require('./config');
// view engine setup
//设置模板的存放路径
app.set('views', path.join(__dirname, 'views'));
//设置模板的引擎，这里是ejs模板
/*app.set('view engine', 'ejs');*/
//这里出于习惯，修改为html模板，那么需要加一个新的配置项，app.engine
app.set('view engine', 'html');
//指定模板的渲染方法
app.engine('html',require('ejs').__express);


// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//session denpends on cookieParser
app.use(session({
  secret:'ming',
  resave:true,//每次respond结束保存一此session
  saveUninitialized:true,//保存新创建但是未初始化的session
  store: new MongoStore({
    url:config.dbUrl
  })
}));

app.use(flash());//登录成功还是失败，有提示

app.use(function(req,res,next){
  res.locals.user = req.session.user;
  //res.locals是真正渲染模板的对象。里面属性最全。这个user只是一部分
  res.locals.success = req.flash('success').toString();
  res.locals.error = req.flash('error').toString();
  res.locals.keyword = req.session.keyword;
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

//指定路由。这里是key。配置跳转，根据不同的路径进行不同的处理
app.use('/', routes);
app.use('/users', users);
app.use('/articles', articles);

// catch 404 and forward to error handler
app.use(function(req, res, next) {

  res.render("404");
});





// error handlers

// development error handler
// will print stacktrace

if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
