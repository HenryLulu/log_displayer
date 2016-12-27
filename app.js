/**
 * Created by Henry on 16/12/7.
 */
var express = require("express");
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var log4js = require('log4js');

var config = require("./common/config");
var api_router = require("./routers/api_router");

log4js.configure({
    appenders: [
        { type: 'console' },
        {
            type: 'file', //文件输出
            filename: 'logs/access.log',
            maxLogSize: 1024,
            backups:3,
            category: 'normal'
        }
    ]
});
var logger = log4js.getLogger('normal');
logger.setLevel('INFO');
app.use(log4js.connectLogger(logger, {level:log4js.levels.INFO}));

app.use(express.static(path.join(__dirname, 'public')));

app.use("/pas",api_router)

app.listen(config.port,function(){
    console.log("Listening on port:" + config.port);
})