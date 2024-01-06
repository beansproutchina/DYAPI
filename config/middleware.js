const dyapi=require("../dyapi/dyapi.js");

const middlewares=[
    (req,res,next)=>{
        //验证登录
        req.role='public';
        if(a=dyapi.findSession(req.header("X-DYSession-Id"))){
            req.role=a.role;
        }
        next()
    },
    (req,res,next)=>{
        res.header("X-Powered-By","DYAPI")
        next()
    },
]

module.exports={
    middlewares,
}