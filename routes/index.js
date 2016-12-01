var express = require('express');
var markdown = require('markdown').markdown;
var models = require('../models');
var router = express.Router();

/**
 * path ָ��·��
 * listener ָ���ص���������
 */
/**
 * ��ҳ ���� ��ǰҳ�� ÿҳ������
 * ��� ��ҳ������ һ������ҳ ��ǰҳ�� ÿҳ������
 */
router.get('/', function(req, res, next) {
    //user �ַ��� ���� user.avatar
    //�Ȳ��� Ȼ���user�ַ���ת��user����
    var keyword = req.query.keyword;//ȡ����ѯ�ؼ���
    var search = req.query.search;//ȡ����ѯ��ť
    var pageNum = parseInt(req.query.pageNum)||1;//��ǰҳ��
    var pageSize = parseInt(req.query.pageSize)||5;//һҳ�ж���������
    var order = req.query.order?parseInt(req.query.order):-1;
    var orderBy = req.query.orderBy||'createAt';
    var queryObj = {};
    if(search){// ���search��ֵ���ύ������
        req.session.keyword = keyword;
    }
    keyword = req.session.keyword;//����keyword�ʹ�session�Ϳ�����
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
        //ȡ����������ж��������ϵ�����
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