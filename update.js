#!/usr/bin/env node
const fs=require('fs')
const path=require('path')

const update=()=>{
    for (let i of fs.readdirSync(__dirname + '/dyapi')) {
        CopyFileReplace(__dirname + '/dyapi/' + i, path.resolve(`./dyapi/${i}`))
    }
    for (let i of fs.readdirSync(__dirname + '/plugins')) {
        CopyFileReplace(__dirname + '/plugins/' + i, path.resolve(`./plugins/${i}`))
    }
    CopyFileReplace(__dirname + '/index.js', path.resolve(`./index.js`));
}

const CopyFileReplace=(src,dest)=>{
    if(fs.existsSync(dest)){
        fs.unlinkSync(dest)
    }
    fs.copyFileSync(src,dest)
}

module.exports={
    update,
}

if(require.main.filename === __filename){
    update();
    console.log('✌update successfully!');
}