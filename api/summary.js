/**
 * Created by Henry on 16/12/7.
 */
var mongo = require("mongodb");
var fs = require('fs');

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

var last_day = function(req,res){
    connect_mongo(res,function(db){
        db.collection('log_table',function(err,tb){
            if(!err){
                var now = new Date()
                var start = new Date(now.getFullYear(),now.getMonth(),now.getDate()-1,0,0,0).getTime()/1000;
                var end = new Date(now.getFullYear(),now.getMonth(),now.getDate(),0,0,0).getTime()/1000;
                var query = {
                    'start':{
                        '$gte':start,
                        '$lt':end
                    }
                }
                tb.find(query).toArray(function(err,logs){
                    if(!err){
                        if(fs.exists(config.sum_dir+'summary.tmp')){
                            res.json({
                                ErrNo:"103",
                                ErrMsg:"some file is writing,please try later"
                            })
                        }
                        var f = fs.createWriteStream(config.sum_dir+'summary.tmp', {'flags': 'a'});
                        var now = new Date().getTime()
                        //var j = 0
                        //while(j<1000){
                        //j++
                        for(var i in logs){
                            f.write(logs[i].start+" "+logs[i].s_ip+" "+logs[i].band+" "+logs[i].jam_r+" "+logs[i].suc_r+" "+logs[i].rate_a+"\n")
                        }
                        //}
                        f.end()
                        console.log(new Date().getTime()-now)
                        fs.rename(config.sum_dir+'summary.tmp',config.sum_dir+'summary')
                        res.redirect("/files/summary")
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
}

var find = function(req,res){
    var start = +req.body.start||null;
    var end = +req.body.end||null;
    var ips = req.body.ips?req.body.ips.split(","):[];
    var server_n = ips.length>0?ips.length:config.server_num;
    if(!(start&&end)){
        res.json({
            ErrNo:"200",
            ErrMsg:"参数有误"
        })
        return
    }else if((end-start)*server_n>50000000){
        res.json({
            ErrNo:"201",
            ErrMsg:"请求数据量过大"
        })
        return
    }
    try{
        connect_mongo(res,function(db){
            db.collection('log_table',function(err,tb){
                if(!err){
                    var now = new Date()
                    var query = {
                        'start':{
                            '$gte':start,
                            '$lt':end
                        }
                    }
                    if(ips&&ips.length>0){
                        query['s_ip'] = {
                            '$in':ips
                        }
                    }
                    console.log(query)
                    tb.find(query).toArray(function(err,logs){
                        if(!err){
                            var f = fs.createWriteStream(config.sum_dir+'summary', {'flags': 'w'});
                            var now = new Date().getTime()
                            //var j = 0
                            //while(j<1000){
                            //j++
                            for(var i in logs){
                                f.write(logs[i].start+" "+logs[i].s_ip+" "+logs[i].band+" "+logs[i].jam_r+" "+logs[i].suc_r+" "+logs[i].rate_a+"\n")
                            }
                            //}
                            f.end()
                            //fs.rename(config.sum_dir+'summary.tmp',config.sum_dir+'summary')
                            res.redirect("/files/summary")
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

var last_five = function(req,res){
    try{
        connect_mongo(res,function(db){
            db.collection('log_table',function(err,tb){
                if(!err){
                    var five_ago = new Date(new Date().getTime()-300000);
                    var start = parseInt(
                        new Date(five_ago.getFullYear(),five_ago.getMonth(),five_ago.getDate(),five_ago.getHours(),
                        parseInt(five_ago.getMinutes()/5)*5,0).getTime()/1000
                    )
                    console.log(start)

                    var query = {
                        'start':start
                    }
                    var back = {
                        start:1,
                        s_ip:1,
                        band:1,
                        freeze_r:1,
                        suc_r:1,
                        bitrate:1,
                        _id:0
                    }
                    tb.find(query,back).toArray(function(err,logs){
                        if(!err){
                            res.json(logs)
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

exports.last_day = last_day
exports.find = find
exports.last_five = last_five