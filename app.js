/**
 * Created by Henry on 16/12/7.
 */
var express = require("express");
var app = express();
var path = require('path');

var config = require("./common/config");
var api_router = require("./routers/api_router");

app.use("/pas",api_router)
app.use(express.static(path.join(__dirname, 'public')));

app.listen(config.port,function(){
    console.log("Listening on port:" + config.port);
})