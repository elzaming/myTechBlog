var express = require('express');
var markdown = require('markdown').markdown;
var models = require('../models');
//这是一个路由的实例。

var auth = require('../middleware/auth');
var multer = require('multer');
var async = require('async');


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../public/uploads')
    },
    filename: function (req, file, cb) {
        cb(null,Date.now()+'.'+(file.mimetype.slice(file.mimetype.indexOf('/')+1)))
    }
});


var upload = multer({ storage: storage });
var router = express.Router();
//下面是配置路由



//发表文章
router.get('/add', auth.checkLogin, function(req, res, next) {
    console.log("publish 25");
    res.render('article/add',{article:{}});



});

router.post('/add',auth.checkLogin,upload.single('attachments'),function(req,res,next){
    var article = req.body;
    var _id = article._id;
    if(_id){

        var updateObj = {title:article.title,content:article.content};
        if(req.file){
            updateObj.attachments = '/uploads/'+req.file.filename;
        }
        models.Article.update({_id:_id},{$set:updateObj},function(err,result){
            if(err){
                req.flash('error','Not successful!');
            }else{
                req.flash('success','Successful');
                res.redirect('/');
            }

            });

    }else{

        if(req.file){
            article.attachments = '/uploads/'+req.file.filename;//访问的public/uploads里面的文件名
        }
        //console.log(req.session);
        article.user = req.session.user._id;//把当前登录的用户id赋给user
        delete article._id;
        if(article.title && article.content){
            models.Article.create(article,function(err,doc){

                if(err){

                    req.flash('error','Some error exists');
                }else{
                    req.flash('success','Successfully published your article');
                    res.redirect('/');
                   // console.log(article, 69);
                }

            });


        }else{
            req.flash('error','Title and content field cannot be empty!');
            res.redirect('back');
        }

    }


});


router.get('/detail/:_id', function (req, res) {
    async.parallel([function (callback) {
        models.Article.findOne({_id: req.params._id})
            .populate('user').populate('comments.user')
            .exec(function (err, article) {
                article.content = markdown.toHTML(article.content);
                callback(err, article);
            });
    }, function (callback) {
        models.Article.update({_id: req.params._id}
            ,{$inc: {pv: 1}}, callback);
    }], function (err, result) {
        if (err) {
            req.flash('error', err);
            res.redirect('back');
        }
        res.render('article/detail',
            {title: 'review articles', article: result[0]});
    });
});



//delete article. Must login, must be the user published the article
router.get('/delete/:_id',auth.checkLogin,function(req,res){
    var article_id=req.params._id;

        models.Article.remove({_id:article_id},function(err,result){//第一个参数必须是对象，如果直接写_id，会全部删除
            res.redirect('/');
        });



});

//edit
router.get('/edit/:_id',auth.checkLogin,function(req,res){
    var _id = req.params._id;
    var userId = req.session.user._id;

        models.Article.findById(_id,function(err,article){
            res.render('article/add',{article:article});
        });


});

//COMMENT
router.post('/comment',auth.checkLogin, function (req, res) {
    var user = req.session.user;
    models.Article.update({_id:req.body._id},{$push:{comments:{user:user._id,content:req.body.content}}},function(err,result){
        if(err){
            req.flash('error',err);
            return res.redirect('back');
        }
        req.flash('success', 'Successful!');
        res.redirect('back');
    });

});




module.exports = router;
