/**
 * Created by Henry on 16/12/7.
 */
var mongo = require("mongodb");

var config = require("../common/config");
var ips = require("../common/ips");

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
                    //var start = parseInt(req.query.time)
                    var time = req.query.time || "201701010000"
                    var start = parseInt(new Date(
                            parseInt(time.substring(0,4)),
                            parseInt(time.substring(4,6))-1,
                            parseInt(time.substring(6,8)),
                            parseInt(time.substring(8,10)),
                            parseInt(time.substring(10,12)),
                            0
                        ).getTime()/1000-3600*8)
                    var query = {
                        'start':start
                    }
                    req.query.sip && (query.s_ip = req.query.sip)
                    var back = {
                        from:1,
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
    ips.get(function(ip_obj){
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
                                var kw_ips = ip_obj.kw;
                                var dl_ips = ip_obj.dl;
                                var ws_ips = ip_obj.ws;
                                var kw_num = 0;
                                var dl_num = 0;
                                var ws_num = 0;
                                var current;
                                var ips = ""
                                for(var l in logs){
                                    logs[l].s_ip && (ips += (logs[l].s_ip+","))
                                }
                                var kw_list = ""
                                for(var i in kw_ips){
                                    current = kw_ips[i];
                                    if(ips.indexOf(current)>=0){
                                        kw_list += "<p style='color: green'>"+current+"</p>"
                                        kw_num ++;
                                    }else{
                                        kw_list += "<p style='color: red'>"+current+"</p>"
                                    }
                                }
                                kw_list = "<p>[KW total:"+kw_num+"/"+kw_ips.length+"]</p>" + kw_list;
                                var dl_list = ""
                                for(var j in dl_ips){
                                    current = dl_ips[j];
                                    if(ips.indexOf(current)>=0){
                                        dl_list += "<p style='color: green'>"+current+"</p>"
                                        dl_num ++;
                                    }else{
                                        dl_list += "<p style='color: red'>"+current+"</p>"
                                    }
                                }
                                dl_list = "<p>[DL total:"+dl_num+"/"+dl_ips.length+"]</p>" + dl_list;
                                var ws_list = ""
                                for(var k in ws_ips){
                                    current = ws_ips[k];
                                    if(ips.indexOf(current)>=0){
                                        ws_list += "<p style='color: green'>"+current+"</p>"
                                        ws_num ++;
                                    }else{
                                        ws_list += "<p style='color: red'>"+current+"</p>"
                                    }
                                }
                                ws_list = "<p>[WS total:"+ws_num+"/"+ws_ips.length+"]</p>" + ws_list;
                                res.send(kw_list+"<p></p>"+dl_list+"<p></p>"+ws_list)
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
    })
}
var test = function(req,res){
    ips.get(function(ips){
        res.send(ips)
    })
}
var cdn_band = function(req,res){
    try{
        connect_mongo(res,function(db){
            db.collection('log_table',function(err,tb){
                if(!err){
                    var start;
                    if(req.query.time){
                        var req_time = req.query.time
                        start = parseInt(new Date(
                                parseInt(req_time.substring(0,4)),
                                parseInt(req_time.substring(4,6))-1,
                                parseInt(req_time.substring(6,8)),
                                parseInt(req_time.substring(8,10)),
                                parseInt(req_time.substring(10,12)),
                                0
                            ).getTime()/1000-3600*8)
                    }else{
                        var five_ago = new Date(new Date().getTime()-300000);
                        start = parseInt(
                            new Date(five_ago.getFullYear(),five_ago.getMonth(),five_ago.getDate(),five_ago.getHours(),
                                parseInt(five_ago.getMinutes()/5)*5,0).getTime()/1000
                        )
                    }

                    var query = {
                        'start':start
                    }
                    var back = {
                        from:1,
                        start:1,
                        band:1,
                        _id:0
                    }
                    var band_collection = {
                        "kw":0,
                        "dl":0,
                        "ws":0,
                        "kwn":0,
                        "dln":0,
                        "wsn":0
                    }
                    tb.find(query,back).toArray(function(err,logs){
                        if(!err){
                            for(var l in logs){
                                var log = logs[l];
                                if(log.from&&log.band){
                                    switch(log.from){
                                        case 1:
                                            band_collection.kw += parseInt(log.band);
                                            band_collection.kwn += 1;
                                            break;
                                        case 2:
                                            band_collection.dl += parseInt(log.band);
                                            band_collection.dln += 1;
                                            break;
                                        case 3:
                                            band_collection.ws += parseInt(log.band);
                                            band_collection.wsn += 1;
                                            break;
                                    }
                                }
                            }
                            var time = new Date((3600*8+start)*1000)
                            band_collection.time = time.getHours()+":"+time.getMinutes()
                            res.json(band_collection)
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

var day_max = function(req,res){
    try{
        connect_mongo(res,function(db){
            db.collection('log_table',function(err,tb){
                if(!err){


                    var start;
                    if(req.query.time){
                        var req_time = req.query.time
                        start = parseInt(new Date(
                                parseInt(req_time.substring(0,4)),
                                parseInt(req_time.substring(4,6))-1,
                                parseInt(req_time.substring(6,8)),
                                parseInt(req_time.substring(8,10)),
                                parseInt(req_time.substring(10,12)),
                                0
                            ).getTime()/1000-3600*8)
                    }else{
                        var five_ago = new Date(new Date().getTime()-300000);
                        start = parseInt(
                            new Date(five_ago.getFullYear(),five_ago.getMonth(),five_ago.getDate(),five_ago.getHours(),
                                parseInt(five_ago.getMinutes()/5)*5,0).getTime()/1000
                        )
                    }

                    var query = {
                        'start':start
                    }
                    var back = {
                        from:1,
                        start:1,
                        band:1,
                        _id:0
                    }
                    var band_collection = {
                        "kw":0,
                        "dl":0,
                        "ws":0,
                        "kwn":0,
                        "dln":0,
                        "wsn":0
                    }
                    tb.find(query,back).toArray(function(err,logs){
                        if(!err){
                            for(var l in logs){
                                var log = logs[l];
                                if(log.from&&log.band){
                                    switch(log.from){
                                        case 1:
                                            band_collection.kw += parseInt(log.band);
                                            band_collection.kwn += 1;
                                            break;
                                        case 2:
                                            band_collection.dl += parseInt(log.band);
                                            band_collection.dln += 1;
                                            break;
                                        case 3:
                                            band_collection.ws += parseInt(log.band);
                                            band_collection.wsn += 1;
                                            break;
                                    }
                                }
                            }
                            var time = new Date((3600*8+start)*1000)
                            band_collection.time = time.getHours()+":"+time.getMinutes()
                            res.json(band_collection)
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
exports.test = test
exports.cdn_band = cdn_band