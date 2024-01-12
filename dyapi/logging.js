const fs = require('fs');
const settings = require('../config/settings.js');
let v=1;
while(fs.existsSync(settings.loggingFile.replace("{n}",v))){
    v++;
}
v--;
let loggingFile=settings.loggingFile.replace("{n}",v);

module.exports = {
    log(level, message) {
        level=level.toUpperCase();
        settings.loggingLevel=settings.loggingLevel.toUpperCase();
        if(level=="TRACE" && settings.loggingLevel!="TRACE")return;
        if(level=="DEBUG" && (settings.loggingLevel!="DEBUG" && settings.loggingLevel!="TRACE"))return;
        if(level=="INFO" && (settings.loggingLevel!="INFO" && settings.loggingLevel!="DEBUG" && settings.loggingLevel!="TRACE"))return;
        if(level=="WARN" && (settings.loggingLevel!="WARN" && settings.loggingLevel!="INFO" && settings.loggingLevel!="DEBUG" && settings.loggingLevel!="TRACE"))return;
        if(level=="ERROR" && (settings.loggingLevel!="ERROR" && settings.loggingLevel!="WARN" && settings.loggingLevel!="INFO" && settings.loggingLevel!="DEBUG" && settings.loggingLevel!="TRACE"))return;
        switch(level){
            case "TRACE":
                console.trace(`[${level}]`,message);
                break;
            case "DEBUG":
                console.debug(`[${level}]`,message);
                break;
            case "INFO":
                console.info(`[${level}]`,message);
                break;
            case "WARN":
                console.warn(`[${level}]`,message);
                break;
            case "ERROR":
                console.error(`[${level}]`,message);
                break;
        }
        if(typeof message!="string"){
            if(message.message){
                message=message.message;
            }else if(message.toString){
                message=message.toString();
            }else{
                try{
                    message=JSON.stringify(message);}
                catch(e){
                    message=""
                }
            }
            
        }
        let date = new Date();
        let time = date.toLocaleString()
        let log = `[${time}][${level}] ${message}\n`;
        fs.appendFile(loggingFile, log, (err) => {
            if (err) console.log(err);
            if(fs.statSync(loggingFile).size>settings.rotatingSize){
                v++;
                loggingFile=settings.loggingFile.replace("{n}",v);
            }
        })
        
    },
    trace(log){
        this.log("TRACE",log);
    },
    debug(log){
        this.log("DEBUG",log);
    },
    info(log){
        this.log("INFO",log);
    },
    warn(log){
        this.log("WARN",log);
    },
    error(log){
        this.log("ERROR",log);
    },
}