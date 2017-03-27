/**
 * Created by Henry on 16/12/7.
 */
var express = require("express");
var app = express();
var path = require('path');
var bodyParser = require('body-parser');

var config = require("./common/config");
var api_router = require("./routers/api_router");
var web_router = require("./routers/web_router");
var log4js = require("./common/logger").log4js;
var logger = require("./common/logger").logger;

app.use(log4js.connectLogger(logger, {level:log4js.levels.INFO}));

app.use(express.static(path.join(__dirname, 'public')));

app.use("/pas",api_router)
app.use('/api',web_router)

app.listen(config.port,function(){
    console.log("Listening on port:" + config.port);
})