const { antiSpider } = require("../dyapi/antiSpider.middleware.js");
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
            req.role = b.role;
        }
        next()
    },
    (req, res, next) => {
        //设置响应头中间件。你最好留着。
        res.header("X-Powered-By", "DYAPI")
        next()
    },
    antiSpider
]

module.exports = {
    middlewares,
}