const dyapi = require("../dyapi/dyapi.js")
const multer = require("multer")
const fs = require("fs")
const model = require("../config/model.js")
const path = require("path")
const logging = require("../dyapi/util/logging.js")
const settings = require("../config/settings.js")
const { randomBytes } = require("crypto")

const CFileStorage = (options = { storageUrl: "storage", storageFolder: "./files/uploads", }) => {
    model.models.MFileStorage = MFileStorage();
    return [new dyapi.Controller(`${options.storageUrl}`, (req, res) => {
        if (req.method == "POST") {
            if (!req.file) {
                res.tosend = {
                    code: 400,
                    message: "没有文件"
                }
            } else {
                if (req.role == "public") {
                    fs.rmSync(req.file.path)
                    res.tosend = {
                        code: 403,
                        message: "没有权限"
                    }

                } else {
                    let r = model.models.MFileStorage.read({
                        filters: [(v) => {
                            return v.filename == req.file.originalname
                        }]
                    })
                    let fnamenew = req.file.originalname
                    if (r.total.count) {
                        fnamenew = randomBytes(4).toString("hex") + "_" + fnamenew
                    }
                    model.models.MFileStorage.create({
                        filename: fnamenew,
                        storagename: req.file.filename,
                    })
                    logging.info("上传文件: " + fnamenew+"("+req.file.filename+")")
                    res.tosend = {
                        code: 200,
                        message: "上传成功",
                        path: settings.urlPrefix + "/" + options.storageUrl + "/" + fnamenew,
                    }
                }
            }
        } else {
            res.tosend = {
                code: 405,
                message: "方法不允许"
            }
        }
    }).use(multer({
        dest: options.storageFolder,
    }).single("file")),
    new dyapi.Controller(`${options.storageUrl}/:fname`, (req, res) => {
        if (req.method == "GET") {
            let r = model.models.MFileStorage.read({
                filters: [(v) => {
                    return v.filename == req.params.fname
                }]
            })
            if (r.total.count) {
                if (req.query.download) {
                    res.download(path.resolve(`${options.storageFolder}/${r.result[0].storagename}`), req.params.fname)
                }else{
                    res.type(path.extname(req.params.fname).slice(1))
                    res.sendFile(path.resolve(`${options.storageFolder}/${r.result[0].storagename}`))
                }
            } else {
                res.sendStatus(404)
            }
        }
        if (req.method == "DELETE") {
            if (["admin"].includes(req.role)) {
                let r = model.models.MFileStorage.read({
                    filters: [(v) => {
                        return v.filename == req.params.fname
                    }]
                })
                if (r.total.count) {
                    fs.rmSync(`${options.storageFolder}/${r.result[0].storagename}`)
                    logging.info("删除文件: " + req.params.fname+`(${r.result[0].storagename})`)
                    res.tosend = {
                        code: 200,
                        message: "删除成功"
                    }
                }
                else {
                    res.tosend = {
                        code: 404,
                        message: "没有找到文件"
                    }
                }
            } else {
                res.tosend = {
                    code: 403,
                    message: "没有权限"
                }
            }
        }
    })
    ]
}

const MFileStorage = () => {
    const container = new dyapi.fileContainer("./files/fileStorage.json");
    return new dyapi.model(container, "files")
        .setPermission("DEFAULT", "")
        .SetField(new dyapi.DataField("filename", dyapi.DataType.String, true, ""))
        .SetField(new dyapi.DataField("storagename", dyapi.DataType.String, true, ""))
}

module.exports = {
    CFileStorage,
    MFileStorage
}