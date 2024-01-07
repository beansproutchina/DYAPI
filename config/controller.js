const dyapi=require("../dyapi/dyapi.js");
const jwt=require("../dyapi/jwt.js");
const model=require("./model.js");
const settings = require("./settings.js");


const controllers=[
    new dyapi.Controller("login",(req,res)=>{
        let query=model.models.user.read({filters:[(v)=>{
            return v.username==req.body.username && v.password==settings.passwordHash(req.body.password)}]})
        if(query.total.count==0){
            res.tosend={
                code:400,
                message:"用户名或密码错误"
            }
        }else{
            let j=jwt.newJwt({
                id:query.result[0].id,
                username:query.result[0].username,
                role:query.result[0].role,
            })
            if(settings.cookieLogin){
                res.setHeader("Set-Cookie","token="+j+";")
            }
            res.tosend={
                code:200,
                message:"登录成功",
                data:{
                    user:query.result[0],
                    token:j,
                }
            }
        }
    }),
    new dyapi.Controller("reg",(req,res)=>{
        if(req.body.username==null || req.body.password==null){
            res.tosend={
                code:400,
                message:"用户名或密码不能为空"
            }
        }else{
            let query=model.models.user.read({filters:[(v)=>{
                return v.username==req.body.username}]})
            if(query.total.count>0){
                res.tosend={
                    code:409,
                    message:"用户名已存在"
                }
            }else{
                let user={
                    username:req.body.username,
                    password:settings.passwordHash(req.body.password),
                }
                model.models.user.create(user)
                res.tosend={
                    code:200,
                    message:"注册成功",
                }
            }
        }
    }),
]

module.exports={
    controllers
}