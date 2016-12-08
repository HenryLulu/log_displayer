/**
 * Created by Henry on 16/12/7.
 */
var mongo = require("mongodb");
var fs = require('fs');

var config = require("../common/config");

function connect_mongo(res,callback){
    try{
        var server = new mongo.Server(config.mongo_addr,config.mongo_port);
        var db = new mongo.Db('log_db',server,{safe:true});
        db.open(function(err){
            if(!err){
                callback(db)
            }else{
                res.json({
                    ErrNo:"100",
                    ErrMsg:"Failed to connect database"
                })
            }
        })
    }
    catch(e){
        console.log(e)
        res.json({
            ErrNo:"100",
            ErrMsg:"Failed to connect database"
        })
        return 0
    }
}

last_day = function(req,res){
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
                                ErrMsg:"some file is writing,please wait"
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

exports.last_day = last_day