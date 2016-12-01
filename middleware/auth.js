//require login to visit

exports.checkLogin = function(req,res,next){
    if(req.session.user){
        next();
    }else{
        req.flash('error','Please log in first!');
        res.redirect('/users/login');
    }

};

//require prelogin or logout to visit
exports.checkNotLogin = function(req,res,next){
  if(req.session.user){
      res.redirect('/');
  }else{
      next();
  }
};

