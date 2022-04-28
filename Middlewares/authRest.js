const Restaurant = require('../Models/restaurants');
const config = require('config');
const jwt = require('jsonwebtoken');

let authRest =(req,res,next)=>{
    let token =req.cookies.auth;
    findByToken(token, Restaurant, (err,restaurant)=>{
        if(err) throw err;
        /*if(!consumer) return res.json({
            error :true
        });*/

        req.token= token;
        req.user=restaurant;
        next();

    })
}

function findByToken(token, user, cb){

    jwt.verify(token,config.get('PrivateKey'),function(err,decode){
        user.findOne({"_id": decode, "token":token},function(err,user){
            if(err) return cb(err);
            cb(null,user);
        })
    })
};



module.exports= authRest;