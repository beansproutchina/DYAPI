#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');
const { exit } = require('process');
const update=require('./update.js');

if (fs.existsSync(path.resolve('./index.js'))) {
    console.log('😔index.js already exists');
    exit(0);
}
fs.mkdirSync(path.resolve(`./config`));
fs.mkdirSync(path.resolve(`./files`));
fs.mkdirSync(path.resolve(`./dyapi`));
fs.mkdirSync(path.resolve(`./plugins`));


fs.copyFileSync(__dirname + '/config/settings.js', path.resolve(`./config/settings.js`), fs.constants.COPYFILE_EXCL)
fs.copyFileSync(__dirname + '/config/controller.js', path.resolve(`./config/controller.js`), fs.constants.COPYFILE_EXCL)
fs.copyFileSync(__dirname + '/config/middleware.js', path.resolve(`./config/middleware.js`), fs.constants.COPYFILE_EXCL)
fs.copyFileSync(__dirname + '/config/model.js', path.resolve(`./config/model.js`), fs.constants.COPYFILE_EXCL)
fs.copyFileSync(__dirname + '/files/database.json', path.resolve(`./files/database.json`), fs.constants.COPYFILE_EXCL)

update.update();


console.log(`✌Project Created Successfully!`)