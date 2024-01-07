const fs = require('fs');
const settings = require('../config/settings');


class fileContainer {
    #filename = "";
    #data = {};
    constructor(filename) {
        this.#filename = filename;
        if (fs.existsSync(this.#filename)) {
            try {
                this.#data = JSON.parse(fs.readFileSync(this.#filename, 'utf8'));
            } catch {
            }
        } else {
            console.log("文件不存在");
        }
        setTimeout(() => {
            this.save();
        }, settings.saveInterval);
    }
    save() {
        fs.writeFileSync(this.#filename, JSON.stringify(this.#data));
        console.log("文件保存完成")
    }
    create(table, item) {
        if (this.#data[table]) {
            this.#data[table].__AI_ID++;
            item.id = this.#data[table].__AI_ID;
            this.#data[table].items.push(item);
        } else {
            item.id = 0;
            this.#data[table] = {
                __AI_ID: 0,
                items: [item]
            };
        }
    }
    read(table, parameters) {
        let total = {
            count: 0,
            pages: 1,
        }
        let result;
        if (!this.#data[table]) {
            result = [];
        } else {
            result = structuredClone(this.#data[table].items);
            if (parameters.fields && parameters.fields.length > 0) {
                for (let ii = 0; ii < result.length; ii++) {
                    let b = {};
                    for (let i of parameters.fields) {
                        b[i] = result[ii][i];
                    }
                    result[ii] = b;
                }
            }
            if (parameters.filters && parameters.filters.length > 0) {
                for (let i of parameters.filters) {
                    result = result.filter(i)
                }
            }
            /*if (parameters.pops && parameters.pops.length > 0) {
                for (i of parameters.pops) {
                    for (let ii = 0; ii < result.length; ii++) {
                        result[ii][i] = this.read(i, { filter: id == result[ii][i] });
                        if (result[ii][i].length) {
                            result[ii][i] = result[ii][i][0];
                        } else {
                            result[ii][i] = null;
                        }
                    }
                }
            }*/
            if (parameters.sort) {
                if (parameters.sort[0] == '~') {
                    parameters.sort = parameters.sort.substring(1);
                    //desc
                    result.sort((a, b) => {
                        if (typeof (a[parameters.sort]) == String) {
                            return b.localeCompare(a[parameters.sort]);
                        } else {
                            return b[parameters.sort] - a[parameters.sort];
                        }
                    })
                } else {
                    //asc
                    result.sort((a, b) => {
                        if (typeof (a[parameters.sort]) == String) {
                            return a.localeCompare(b[parameters.sort]);
                        } else {
                            return a[parameters.sort] - b[parameters.sort];
                        }
                    })
                }
            }
            total.count = result.length;

            if (parameters.limit) {
                if (!parameters.pagination) {
                    parameters.pagination = 1;
                } else {
                    total.pages = Math.ceil(total.count / parameters.limit);
                }
                result = result.slice((parameters.pagination - 1) * parameters.limit, parameters.pagination * parameters.limit);
            }


        }
        return {
            total,
            result
        }
    }
    update(table, item) {
        if (!this.#data[table]) {
            this.#data[table] = {
                __AI_ID: 0,
                items: []
            };
            return false;
        }
        for (let i of this.#data[table].items) {
            if (i.id == item.id) {
                i = item;
                return true;
            }
        }
        return false;
    }
    patch(table, item) {
        if (!this.#data[table]) {
            this.#data[table] = {
                __AI_ID: 0,
                items: []
            };
            return false;
        }
        for (let i of this.#data[table].items) {
            if (i.id == item.id) {
                for (let ii of Object.getOwnPropertyNames(item)) {
                    if (ii.startsWith("__")) {
                        continue;
                    }
                    i[ii] = item[ii];
                }
                return true;
            }
        }
        return false;
    }
    del(table, filter) {
        if (!this.#data[table]) {
            this.#data[table] = {
                __AI_ID: 0,
                items: []
            };
            return;
        }
        this.#data[table].items = this.#data[table].items.filter((x) => { return !filter(x) });
    }
    raw(table) {
        if (!this.#data[table]) {
            this.#data[table] = {
                __AI_ID: 0,
                items: []
            };
        }
        return this.#data[table].items;
    }

}

class model {
    #container;
    #tablename;
    #permission = {};
    services = [];
    #datafields/*:Array<DataField>*/ = [new DataField("id", DataType.Number, false, 0)];
    constructor(container, tablename) {
        this.#container = container;
        this.#tablename = tablename;
    }
    create(content) {
        for (let i of this.#datafields) {
            if (!content[i.name]) {
                if (i.required) {
                    return false;
                } else {
                    content[i.name] = i.defaultvalue;
                    if (i.type == DataType.Date && i.defaultvalue == null) {
                        content[i.name] = new Date();
                    }
                }
            }
            switch (i.type) {
                case DataType.Number:
                    content[i.name] = Number(content[i.name]);
                    break;
                case DataType.String:
                    content[i.name] = String(content[i.name]);
                    break;
                case DataType.Date:
                    content[i.name] = new Date(content[i.name]);
                    break;
            }
        }
        content = Object.fromEntries(Object.entries(content).filter((x) => this.#datafields.find((y) => y.name == x[0])))
        this.#container.create(this.#tablename, content);
        return true;
    }
    read(parameters) {
        return this.#container.read(this.#tablename, parameters);
    }
    update(item) {
        item = Object.fromEntries(Object.entries(item).filter((x) => this.#datafields.find((y) => y.name == x[0])))
        return this.#container.update(this.#tablename, item);
    }
    patch(item) {
        item = Object.fromEntries(Object.entries(item).filter((x) => this.#datafields.find((y) => y.name == x[0])))
        return this.#container.patch(this.#tablename, item);
    }
    delete(filter) {
        this.#container.del(this.#tablename, filter);
    }
    setPermission(usertype, permission) {
        this.#permission[usertype] = permission + ",";
        return this;
    }
    getPermission(usertype, permission) {
        if (!this.#permission[usertype]) {
            return (this.#permission["DEFAULT"] ?? "C,R,U,D,").includes(permission + ",")//默认为CRUD
        }
        if (permission == null) { return true };
        return this.#permission[usertype].includes(permission + ",");
    }
    registerService(permission, operation, service) {
        if (!isNaN(parseFloat(operation))) {
            console.log("服务url不能是数字");
            return this;
        }
        this.services.push({
            permission: permission,
            operation: operation,
            service: service,
        })
        return this;
    }
    urlFilter(field, value) {
        switch (this.#datafields.find(x => x.name == field).type) {
            case DataType.Number:
                if (value.startsWith("~")) {
                    if (value.endsWith("~")) {
                        return (v) => { return v[field] != Number(value.slice(1, -1)) }
                    } else {
                        return (v) => { return v[field] < Number(value.slice(1)) }
                    }
                } else if (value.endsWith("~")) {
                    return (v) => { return v[field] > Number(value.slice(0, -1)) }
                }
                return (v) => { return v[field] == Number(value) }
            case DataType.Date:

                if (value.startsWith("~")) {
                    if (value.endsWith("~")) {
                        return (v) => { return v[field] != new Date(value.slice(1, -1)) }
                    } else {
                        return (v) => { return v[field] < new Date(value.slice(1)) }
                    }
                } else if (value.endsWith("~")) {
                    return (v) => { return v[field] > new Date(value.slice(0, -1)) }
                }
                return (v) => {
                    return v[field] == new Date(value)
                }
            case DataType.String:
                if (value.startsWith("~")) {
                    if (value.endsWith("~")) {
                        return (v) => { return v[field].includes(value.slice(1, -1)) }
                    } else {
                        return (v) => { return v[field].endsWith(value.slice(1)) }
                    }
                } else if (value.endsWith("~")) {
                    return (v) => { return v[field].startsWith(value.slice(0, -1)) }
                }
                return (v) => { return v[field] == value }
        }
    }
    Q(usertype, operation, content) {
        try {
            switch (operation) {
                case "create":
                    if (this.getPermission(usertype, "C")) {

                        this.create(content);
                        return {
                            code: 200,
                            message: "创建成功"
                        }
                    }
                    return {
                        code: 403,
                        message: `无权访问`
                    }
                    break;
                case "read":
                    if (this.getPermission(usertype, "R") || this.getPermission(usertype, "RO") || this.getPermission(usertype, "RL")) {
                        if (!content || !content.fields) {
                            content.fields = this.#datafields.filter((v) => { return v.getPermission(usertype, "r") }).map((v) => { return v.name })
                        } else {
                            if (content.fields.find((v) => { return !this.#datafields.find((u) => { return u.name == v && u.getPermission(usertype, "r") }) })) {
                                return {
                                    code: 403,
                                    message: `字段不存在或无权访问`
                                }
                            };
                        }
                        let data = this.read(content);
                        if (content.pops && content.pops.length > 0) {
                            for (let i of content.pops) {
                                for (let ii of data.result) {
                                    let r = i.model.Q(usertype, "read", {
                                        filters: [
                                            (v) => { return v.id == ii[i.name] }
                                        ]
                                    })
                                    if (r.total.count > 0) {
                                        ii[i.name] = r.data[0];
                                    }
                                }
                            }
                        }
                        if (data.total.count == 0) {
                            return {
                                code: 404,
                                message: `未找到数据`,
                                total: data.total,
                                data: [],
                            }
                        }
                        if (data.total.count == 1) {
                            if (this.getPermission(usertype, "R") || this.getPermission(usertype, "RO")) {
                                return {
                                    code: 200,
                                    message: `读取成功`,
                                    total: data.total,
                                    data: data.result[0]
                                };
                            }
                        }
                        if (this.getPermission(usertype, "R") || this.getPermission(usertype, "RL")) {
                            return {
                                code: 200,
                                message: `读取成功`,
                                total: data.total,
                                data: data.result
                            };
                        }
                        return {
                            code: 403,
                            message: `无权访问`
                        }
                    }
                    return {
                        code: 403,
                        message: `无权访问`
                    }
                    break;
                case "update":
                case "patch":
                    if (this.getPermission(usertype, "U")) {
                        for (let i of Object.getOwnPropertyNames(content)) {
                            if (!this.#datafields.find((v) => { return v.name == i && v.getPermission(usertype, "w") })) {
                                return {
                                    code: 403,
                                    message: `字段不存在或无权访问`
                                }
                            }
                            switch (this.#datafields.find((v) => { return v.name == i }).type) {
                                case DataType.Number:
                                    content[i] = Number(content[i]);
                                    break;
                                case DataType.String:
                                    content[i] = String(content[i]);
                                    break;
                                case DataType.Date:
                                    content[i] = new Date(content[i]);
                            }
                        }
                        let success = false;
                        if (operation == "update") {
                            success = this.update(content);
                        } else {
                            success = this.patch(content);
                        }
                        if (success) {
                            return {
                                code: 200,
                                message: "更新成功"
                            }
                        } else {
                            return {
                                code: 404,
                                message: "记录不存在，更新失败。"
                            }
                        }
                    }
                    return {
                        code: 403,
                        message: `无权访问`
                    }
                    break;
                case "delete":
                    if (this.getPermission(usertype, "D")) {
                        this.delete(content);
                        return {
                            code: 200,
                            message: "删除成功"
                        }
                    }
                    return {
                        code: 403,
                        message: `无权访问`
                    }
                    break;
                default:
                    for (let i of this.services) {
                        if (i.operation == operation && this.getPermission(usertype, i.permission)) {
                            return i.service(this.#container, content);
                        }
                    }
                    return {
                        code: 400,
                        message: "未找到该操作"
                    }
            }
        } catch (e) {
            console.error(e);
            return {
                code: 500,
                message: e
            }
        }

    }
    SetField(...dataField) {
        this.#datafields.push(...dataField);
        for (let u of dataField) {
            for (let i of this.#container.raw(this.#tablename)) {
                if (i[u.name]) {
                    switch (u.type) {
                        case DataType.Number:
                            i[u.name] = Number(i[u.name]);
                            break;
                        case DataType.String:
                            i[u.name] = String(i[u.name]);
                            break;
                        case DataType.Date:
                            i[u.name] = new Date(i[u.name]);
                            break;
                    }
                } else {
                    i[u.name] = u.defaultvalue;
                }
            }
        }
        return this;
    }
}
class DataField {
    name = ""
    type = DataType.Object;
    required = false;
    defaultvalue = null;
    #permission = {};
    setPermission(usertype, permission) {
        this.#permission[usertype] = permission + ",";
        return this;
    }
    getPermission(usertype, permission) {
        if (this.#permission[usertype]) {
            return this.#permission[usertype].includes(permission + ",");
        } else {
            return (this.#permission["DEFAULT"] ?? "r,w,").includes(permission + ",");//默认为r,w
        }

    }
    constructor(name, type, required, defaultvalue) {
        this.name = name;
        this.type = type;
        this.required = required;
        this.defaultvalue = defaultvalue;
    }
}

const DataType = {
    String: "string",
    Number: "number",
    Date: "date",
    Object: "object",
}

class Controller {
    url = "";
    control = () => { };
    constructor(url, control) {
        this.url = url;
        this.control = control;
        if (this.url.endsWith("s")) {
            console.log("控制器不能以s结尾，防止与模型访问冲突。")
        }
        if (this.url.startsWith("/")) {
            this.url = this.url.slice(1);
        }
    }
}

module.exports = {
    model,
    fileContainer,
    DataField,
    DataType,
    Controller,
}