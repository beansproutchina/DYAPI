const { antiSpider } = require("../plugins/antiSpider.middleware.js");
const dyapi = require("../dyapi/dyapi.js");
const jwt = require("../dyapi/jwt.js");
const settings = require("./settings.js");
const middlewares = [
    (req, res, next) => {
        //验证登录中间件
        req.role = 'public';
        let a, b;
        if (settings.cookieLogin) {
            if (a = req.cookies.token) {
                b = jwt.checkJwt(a)
            }
        } else {
            if (a = req.header("X-DYAPI-Token")) {
                b = jwt.checkJwt(a)
            }
        }
        if(b){
            req.user=b;
            req.role = b.role;
        }
        next()
    },
    antiSpider({
        requestsPerMin:{
            soft:20,
            hard:100,
        },
        globalMode:false,
        softMistakeRate:0.1,
    })
]

module.exports = {
    middlewares,
}