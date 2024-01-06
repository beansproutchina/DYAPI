const dyapi=require("../dyapi/dyapi.js");
const model=require("./model.js");


const controllers=[
    new dyapi.Controller("users/login",(req,res)=>{
        let query=model.models.user.read({filters:[(v)=>{
            return v.username==req.body.username && v.password==req.body.password}]})
        if(query.total.count==0){
            res.send({
                code:400,
                message:"用户名或密码错误"
            })
        }else{
            res.setHeader("Set-Cookie","dysessionid:"+dyapi.newSession(query.result[0],60*1000))
            res.send({
                code:200,
                message:"登录成功",
                data:{
                    user:query.result[0],
                    token:dyapi.newSession(query.result[0],60*1000)
                }
            })
        }
    })
]

module.exports={
    controllers
}