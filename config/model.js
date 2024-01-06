const dyapi=require("../dyapi/dyapi.js");

const fileContainers=[
    new dyapi.fileContainer("./files/database.json")
];
const models={
    user:
        new dyapi.model(fileContainers[0], "users")
            .setPermission("public","C,R,U,D")
            .SetField(
                new dyapi.DataField("username",dyapi.DataType.String,true,""),
                new dyapi.DataField("password",dyapi.DataType.String,true,""),
                new dyapi.DataField("lastontime",dyapi.DataType.Date,false,null),
                new dyapi.DataField("role",dyapi.DataType.String,false,"user").setPermission("public","r"),
            ),
}


module.exports = {
    models,
    fileContainers
}
