var express = require('express');
var markdown = require('markdown').markdown;
var models = require('../models');
var router = express.Router();

/**
 * path 指定路径
 * listener 指定回调监听函数
 */
/**
 * 分页 传参 当前页码 每页的条数
 * 结果 当页的数据 一共多少页 当前页码 每页的条数
 */
router.get('/', function(req, res, next) {
    //user 字符串 对象 user.avatar
    //先查找 然后把user字符串转成user对象
    var keyword = req.query.keyword;//取出查询关键字
    var search = req.query.search;//取出查询按钮
    var pageNum = parseInt(req.query.pageNum)||1;//当前页码
    var pageSize = parseInt(req.query.pageSize)||5;//一页有多少条数据
    var order = req.query.order?parseInt(req.query.order):-1;
    var orderBy = req.query.orderBy||'createAt';
    var queryObj = {};
    if(search){// 如果search有值，提交过来的
        req.session.keyword = keyword;
    }
    keyword = req.session.keyword;//我们keyword就从session就可以了
    var reg = new RegExp(keyword,'i');
    queryObj = {$or:[{title:reg},{content:reg}]};
    var orderObj = {};
    if(orderBy){
        orderObj[orderBy]=order;
    }

    models.Article.find(queryObj).sort(orderObj).skip((pageNum-1)*pageSize).limit(pageSize).populate('user').sort({createAt:-1}).exec(function(err,articles){
        articles.forEach(function(article){
            article.content = markdown.toHTML(article.content);
        });
        //取得这个条件有多少条符合的数据
        models.Article.count(queryObj,function(err,count){
            res.render('index', {
                articles: articles,
                totalPage:Math.ceil(count/pageSize),
                keyword:keyword,
                pageNum:pageNum,
                pageSize:pageSize,
                order:order,
                orderBy:orderBy
            });
        })
    });
});

//The about page
router.get('/about',function(req,res,next){
    res.render('about');
});


module.exports = router;