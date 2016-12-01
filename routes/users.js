var express = require('express');
var models = require('../models');
var util = require('../util');
var auth = require('../middleware/auth');

//这是一个路由的实例。
var router = express.Router();

//一下是配置路由
//register
router.get('/reg', auth.checkNotLogin,function(req, res, next) {
  res.render('user/reg',{title:'register'});
});

router.post('/reg',auth.checkNotLogin, function(req,res,next){
  var user = req.body;
  if(user.password!=user.repassword){
    res.redirect('back');
  }else{
    req.body.password = util.md5(req.body.password);
    req.body.avatar = 'http://secure.gravatar.com/avatar/'+util.md5(req.body.email)+'?s=48';
    models.User.create(req.body,function(err,doc){//保存
      if(err){
        req.flash('error','Not successful!');
      }else{
        req.flash('success','Successfully registered!');
        res.redirect('/users/login');
      }

    });
  }

});

//login
router.get('/login', auth.checkNotLogin, function(req, res, next) {
  res.render('user/login',{title:'login'});
});

router.post('/login', auth.checkNotLogin, function(req, res, next) {
  req.body.password = util.md5(req.body.password);
  models.User.findOne({username:req.body.username,password:req.body.password},function(err,doc){
    if(err){
     /* req.flash('error','用户登录失败!');*/
      res.redirect('back');
    }else{
      if(doc){
        //登录成功，把查询到的user用户赋予 session.user
        req.session.user = doc;
        req.flash('success','Log in successfully');
        res.redirect('/');
      }else{//找不到，登陆失败了
        req.flash('error','Username or password is not correct.');
        res.redirect('back');
      }
    }
  });
});


//logout
router.get('/logout', auth.checkLogin, function(req, res, next) {
  req.session.user = null;
  req.flash('success',"Logout successfully!");
  res.redirect('/');
});



/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
