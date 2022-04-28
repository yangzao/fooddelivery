
const Consumer = require('../Models/consumers');
const config = require('config');
const jwt = require('jsonwebtoken');

let authCons =(req,res,next)=>{
    let token =req.cookies.auth;
    findByToken(token, Consumer, (err,consumer)=>{
        if(err) throw err;
        /*if(!consumer) return res.json({
            error :true
        });*/

        req.token= token;
        req.user=consumer;
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



module.exports= authCons;