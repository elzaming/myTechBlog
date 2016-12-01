var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
//��Ϊ�漰���������£����������һ��articles·��
var articles = require('./routes/articles');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var flash = require('connect-flash');

var app = express();
app.set('env',process.env.ENV);
var config = require('./config');
// view engine setup
//����ģ��Ĵ��·��
app.set('views', path.join(__dirname, 'views'));
//����ģ������棬������ejsģ��
/*app.set('view engine', 'ejs');*/
//�������ϰ�ߣ��޸�Ϊhtmlģ�壬��ô��Ҫ��һ���µ������app.engine
app.set('view engine', 'html');
//ָ��ģ�����Ⱦ����
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
  resave:true,//ÿ��respond��������һ��session
  saveUninitialized:true,//�����´�������δ��ʼ����session
  store: new MongoStore({
    url:config.dbUrl
  })
}));

app.use(flash());//��¼�ɹ�����ʧ�ܣ�����ʾ

app.use(function(req,res,next){
  res.locals.user = req.session.user;
  //res.locals��������Ⱦģ��Ķ�������������ȫ�����userֻ��һ����
  res.locals.success = req.flash('success').toString();
  res.locals.error = req.flash('error').toString();
  res.locals.keyword = req.session.keyword;
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

//ָ��·�ɡ�������key��������ת�����ݲ�ͬ��·�����в�ͬ�Ĵ���
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
