const express = require('express');
const cookieparser = require("cookie-parser");
const settings = require("./config/settings");
const model = require('./config/model');
const middleware = require('./config/middleware');
const controller = require('./config/controller');
const process = require("process");
const app = express();
app.use(cookieparser());
app.use(express.json());

app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.send({
        code: 500,
        message: err.message,
    });
});

const RefreshRoutes = () => {
    app.routes = [];
    for (let i of controller.controllers) {
        app.all(`/${settings.urlPrefix}/${i.url}`, (req, res) => {
            MiddlewareChain(req, res, i.control.bind(this, req, res))
        })
    }
    for (let [key, value] of Object.entries(model.models)) {
        app.get(`/${settings.urlPrefix}/${key}s`, (req, res) => {
            req.parameter = queryProcess(value, req.query);
            MiddlewareChain(req, res, () => { res.tosend = (value.Q(req.role, "read", req.parameter)) })
        })
        app.get(`/${settings.urlPrefix}/${key}s/:id`, (req, res) => {
            req.parameter = queryProcess(value, req.query);
            req.parameter.filters = [(i) => { return i.id == req.params.id }];
            MiddlewareChain(req, res, () => { res.tosend = (value.Q(req.role, "read", req.parameter)) })
        })
        app.post(`/${settings.urlPrefix}/${key}s`, (req, res) => {
            MiddlewareChain(req, res, () => { res.tosend = (value.Q(req.role, "create", req.body)) })
        })
        app.put(`/${settings.urlPrefix}/${key}s/:id`, (req, res) => {
            MiddlewareChain(req, res, () => { res.tosend = (value.Q(req.role, "update", { ...req.body, id: req.params.id })) })
        })
        app.delete(`/${settings.urlPrefix}/${key}s/:id`, (req, res) => {
            MiddlewareChain(req, res, () => { res.tosend = (value.Q(req.role, "delete", { id: req.params.id })) })
        })
        app.patch(`/${settings.urlPrefix}/${key}s/:id`, (req, res) => {
            MiddlewareChain(req, res, () => { res.tosend = (value.Q(req.role, "patch", { ...req.body, id: req.params.id })) })
        })
        for (i of value.services) {
            app.all(`/${settings.urlPrefix}/${key}s/${i.operation}`, (req, res) => {
                MiddlewareChain(req, res, () => { res.tosend = (value.Q(req.role, i.operation, req.body)) })
            })
        }
    }
    app.all(`*`, (req, res) => {
        res.send({
            code: 400,
            message: "未找到该操作",
        })
    })
}
const MiddlewareChain = (req, res, final) => {
    for (let i of middleware.middlewares) {
        final = i.bind(this, req, res, final);
    }
    final();
    res.send(res.tosend)
}
const queryProcess = (model, query) => {
    let parameter = {
        limit: settings.maxLimit,
        filters: [],
    };
    for (let [key, val] of Object.entries(query)) {
        switch (key) {
            case "page":
                parameter.pagination = Number(val);
                break;
            case "sort":
                parameter.sort = val;
                break;
            case "limit":
                parameter.limit = Math.min(val, Number(settings.maxLimit));
                break;
            case "fields":
                parameter.fields = val.split(",");
                break;
            case "pops":
                parameter.pops = val.split(",");
                break;
            default:
                parameter.filters.push(model.urlFilter.call(model, key, val))
        }
    }
    return parameter;
}

RefreshRoutes();

app.listen(settings.port, () => {
    console.log(`服务器启动成功 http://localhost:${settings.port}`);
})

process.on('SIGINT', ()=>{
    for (let i = 0; i < model.fileContainers.length; i++) {
        model.fileContainers[i].save();
    }
    process.exit(0);
});


//路由
//中间件
//模型


