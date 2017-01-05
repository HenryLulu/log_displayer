/**
 * Created by Henry on 16/12/7.
 */
var mongo = require("mongodb");

var config = require("../common/config");

function connect_mongo(res,callback){
    var MongoClient = require('mongodb').MongoClient;
    MongoClient.connect(config.mongo_addr,config.mongo_option, function (err, db) {
            if(!err){
                callback(db)
            }else{
                console.log(err)
                res.json({
                    ErrNo:"100",
                    ErrMsg:"Failed to connect database"
                })
            }
    })
}

var last_five = function(req,res){
    try{
        connect_mongo(res,function(db){
            db.collection('log_table',function(err,tb){
                if(!err){
                    var five_ago = new Date(new Date().getTime()-600000);
                    var start = parseInt(
                        new Date(five_ago.getFullYear(),five_ago.getMonth(),five_ago.getDate(),five_ago.getHours(),
                        parseInt(five_ago.getMinutes()/5)*5,0).getTime()/1000
                    )
                    //console.log(start)

                    var query = {
                        'start':start
                    }
                    var back = {
                        start:1,
                        s_ip:1,
                        band:1,
                        suc_r:1,
                        freeze_r:1,
                        bitrate:1,
                        _id:0
                    }
                    tb.find(query,back).toArray(function(err,logs){
                        if(!err){
                            res.json(logs)
                            db.close()
                        }else{
                            res.json({
                                ErrNo:"102",
                                ErrMsg:"Failed to get logs"
                            })
                        }
                    })
                }else{
                    res.json({
                        ErrNo:"101",
                        ErrMsg:"Failed to get table"
                    })
                }
            })
        })
    }catch(e){
        res.json({
            ErrNo:"100",
            ErrMsg:"数据库错误"
        })
    }
}

var get_time = function(req,res){
    try{
        connect_mongo(res,function(db){
            db.collection('log_table',function(err,tb){
                if(!err){
                    var start = parseInt(req.params.time)
                    var query = {
                        'start':start
                    }
                    var back = {
                        start:1,
                        s_ip:1,
                        band:1,
                        suc_r:1,
                        freeze_r:1,
                        bitrate:1,
                        _id:0
                    }
                    tb.find(query,back).toArray(function(err,logs){
                        if(!err){
                            res.json(logs)
                            db.close()
                        }else{
                            res.json({
                                ErrNo:"102",
                                ErrMsg:"Failed to get logs"
                            })
                        }
                    })
                }else{
                    res.json({
                        ErrNo:"101",
                        ErrMsg:"Failed to get table"
                    })
                }
            })
        })
    }catch(e){
        res.json({
            ErrNo:"100",
            ErrMsg:"数据库错误"
        })
    }
}


var complete = function(req,res){
    try{
        connect_mongo(res,function(db){
            db.collection('log_table',function(err,tb){
                if(!err){
                    var five_ago = new Date(new Date().getTime()-300000);
                    var start = parseInt(
                        new Date(five_ago.getFullYear(),five_ago.getMonth(),five_ago.getDate(),five_ago.getHours(),
                            parseInt(five_ago.getMinutes()/5)*5,0).getTime()/1000
                    )
                    //console.log(start)

                    var query = {
                        'start':start
                    }
                    var back = {
                        s_ip:1,
                        _id:0
                    }
                    tb.find(query,back).toArray(function(err,logs){
                        if(!err){
                            var all_ips = config.all_ips;
                            var ips = ""
                            for(var l in logs){
                                logs[l].s_ip && (ips += (logs[l].s_ip+","))
                            }
                            var ip_list = "<p>[total:"+logs.length+"/"+all_ips.length+"]</p>";
                            for(var i in all_ips){
                                var current = all_ips[i];
                                if(ips.indexOf(current)>=0){
                                    ip_list += "<p style='color: green'>"+current+"</p>"
                                }else{
                                    ip_list += "<p style='color: red'>"+current+"</p>"
                                }
                            }
                            res.send(ip_list)
                            db.close()
                        }else{
                            res.json({
                                ErrNo:"102",
                                ErrMsg:"Failed to get logs"
                            })
                        }
                    })
                }else{
                    res.json({
                        ErrNo:"101",
                        ErrMsg:"Failed to get table"
                    })
                }
            })
        })
    }catch(e){
        res.json({
            ErrNo:"100",
            ErrMsg:"数据库错误"
        })
    }
}


exports.last_five = last_five
exports.complete = complete
exports.get_time = get_time