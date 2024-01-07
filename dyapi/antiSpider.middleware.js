const settings = {
    requestsPerMin: {
        soft: 20,
        hard: 600,
    },
    globalMode: false,
    softMistakeRate: 1,
}

const safelist = ["{", "}", ",", "[", "]", ":", "\\", '"', "n", "u", "l", "T", "Z"];
const ipBucket = {
}

setInterval(() => {
    for (let [key, val] of Object.entries(ipBucket)) {
        ipBucket[key] -= settings.requestsPerMin.soft;
        if (ipBucket[key] < 0) {
            delete ipBucket[key];
        }
    }
}, 60*1000);

const antiSpider = (req, res, next) => {
    let ip = "t"
    if (!settings.globalMode) {
        if (req.headers['X-Forwarded-For']) {
            ip = req.headers['X-Forwarded-For'].split(',')[0];
        } else {
            ip = req.connection.remoteAddress;
        }
    }
    if (ipBucket[ip]) {
        if (ipBucket[ip] >= settings.requestsPerMin.hard) {
            res.tosend = {
                status: 429,
                message: "Too many requests",
            }
        } else if (ipBucket[ip] >= settings.requestsPerMin.soft) {
            next();
            if(!res.tosend){
                return;
            }
            let code = res.tosend.code;
            let message= res.tosend.message;
            let tosend = JSON.stringify(res.tosend);
            for (let i = 0; i < tosend.length; i++) {
                let pos = Math.floor(Math.random() * tosend.length);
                if (safelist.includes(tosend[pos])) {
                    continue;
                }
                if (tosend.slice(0, pos).lastIndexOf('":') < Math.max(tosend.slice(0, pos).lastIndexOf(','), tosend.slice(0, pos).lastIndexOf('{'))) {
                    continue;
                }
                if (Math.min(tosend.slice(pos, tosend.length).indexOf(","), tosend.slice(pos, tosend.length).indexOf("}")) > tosend.slice(pos, tosend.length).indexOf(":")) {
                    continue;
                }
                let ahoh;
                if (isNaN(tosend[pos])) {
                    let code = tosend.charCodeAt(pos);
                    if (code >= 65 && code <= 122) {
                        //字母
                        ahoh = String.fromCharCode(65 + Math.floor(Math.random() * 56))
                    } else {
                        //其他字符
                        ahoh = String.fromCharCode(tosend.charCodeAt(pos) + Math.floor(Math.random() * 15)-5)
                    }
                    if (safelist.includes(ahoh)) {
                        continue;
                    }
                } else {
                    //数字
                    ahoh = String(Math.floor(Math.random() * 9) + 1)
                }
                tosend = tosend.slice(0, pos) + ahoh + tosend.slice(pos + 1, tosend.length);
                if (i > tosend.length * settings.softMistakeRate) {
                    break;
                }
            }
            res.tosend = JSON.parse(tosend)
            res.tosend.code = code;
            //res.tosend.message= message;
        }
        else {
            ipBucket[ip]++;
            next();
        }
    } else {
        ipBucket[ip] = 1;
        next();
    }
}

module.exports = {
    antiSpider
}