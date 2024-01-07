const dyapi=require("../dyapi/dyapi.js");

const fileContainers=[
    new dyapi.fileContainer("./files/database.json")
];
const models={
    user:
        new dyapi.model(fileContainers[0], "users")
            .setPermission("DEFAULT","R,U")
            .SetField(
                new dyapi.DataField("username",dyapi.DataType.String,true,""),
                new dyapi.DataField("password",dyapi.DataType.String,true,"").setPermission("DEFAULT","w"),
                new dyapi.DataField("lastontime",dyapi.DataType.Date,false,null),
                new dyapi.DataField("role",dyapi.DataType.String,false,"user").setPermission("DEFAULT","r").setPermission("admin","r,w"),
            ),
}


module.exports = {
    models,
    fileContainers
}
