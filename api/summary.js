/**
 * Created by Henry on 16/12/7.
 */
var mongo = require("mongodb");
var moment = require("moment");

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
                            from:1,
                            version:1,
                            md5:1,
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
                                var current_re;
                                var current
                                var ips = ""
                                for(var l in logs){
                                    logs[l].s_ip && (ips += (logs[l].s_ip+":"+(logs[l].version||"unk")+":"+(logs[l].md5||"unk")+","))
                                }
                                var kw_list = ""
                                for(var i in kw_ips){
                                    current = kw_ips[i]
                                    current_re = ips.match(new RegExp(kw_ips[i]+":[^:]*:[^:]*,"))
                                    if(current_re){
                                        kw_list += "<p style='color: green'>"+current_re[0]+"</p>"
                                        kw_num ++;
                                    }else{
                                        kw_list += "<p style='color: red'>"+current+"</p>"
                                    }
                                }
                                kw_list = "<p>[KW total:"+kw_num+"/"+kw_ips.length+"]</p>" + kw_list;
                                var dl_list = ""
                                for(var j in dl_ips){
                                    current = dl_ips[j];
                                    current_re = ips.match(new RegExp(dl_ips[j]+":[^:]*:[^:]*,"))
                                    if(current_re){
                                        dl_list += "<p style='color: green'>"+current_re[0]+"</p>"
                                        dl_num ++;
                                    }else{
                                        dl_list += "<p style='color: red'>"+current+"</p>"
                                    }
                                }
                                dl_list = "<p>[DL total:"+dl_num+"/"+dl_ips.length+"]</p>" + dl_list;
                                var ws_list = ""
                                for(var k in ws_ips){
                                    current = ws_ips[k]
                                    current_re = ips.match(new RegExp(ws_ips[k]+":[^:]*:[^:]*,"))
                                    if(current_re){
                                        ws_list += "<p style='color: green'>"+current_re[0]+"</p>"
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
    var datestr = moment().format('YYYYMMDD');
    var date = moment(datestr,"YYYYMMDD");
    res.send({
        begin:date.startOf('day').unix(),
        end:date.endOf('day').unix()
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
                    var date = moment(req.query.date || moment().format('YYYYMMDD'));
                    var query = {
                        'start':{
                            '$gte':date.startOf('day').unix(),
                            '$lt':date.endOf('day').unix()
                        }
                    }
                    var back = {
                        from:1,
                        start:1,
                        band:1,
                        _id:0
                    }
                    var band_collection = {
                        "kw":{},
                        "dl":{},
                        "ws":{}
                    }
                    var band_max = {
                        kw:{
                            band:0,
                            time:""
                        },
                        dl:{
                            band:0,
                            time:""
                        },
                        ws:{
                            band:0,
                            time:""
                        },
                    }
                    tb.find(query,back).toArray(function(err,logs){
                        if(!err){
                            for(var l in logs){
                                var log = logs[l];
                                if(log.from&&log.band){
                                    switch(log.from){
                                        case 1:
                                            band_collection.kw[log.start] += parseInt(log.band);
                                            break;
                                        case 2:
                                            band_collection.dl[log.start] += parseInt(log.band);
                                            break;
                                        case 3:
                                            band_collection.ws[log.start] += parseInt(log.band);
                                            break;
                                    }
                                }
                            }
                            console.log(band_collection.kw)
                            for(var cdn in band_collection){
                                var band_max = 0,time_max = ""
                                var current_cdn = band_collection[cdn];
                                for(var five_min in current_cdn){
                                    if(current_cdn[five_min]>band_max[cdn]){
                                        band_max = current_cdn[five_min];
                                        time_max = five_min;
                                    }
                                }
                                band_max[cdn].band = band_max;
                                band_max[cdn].time = moment.unix(parseInt(time_max)).format("MM-DD HH:mm")
                            }
                            res.json(band_max)
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
var level_1_2 = function(req,res){
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
                        s_ip:1,
                        _id:0
                    }
                    var band_collection = {
                        //"kw":0,
                        "dl":0,
                        //"ws":0,
                        //"kwn":0,
                        //"dln":0,
                        //"wsn":0
                    }
                    tb.find(query,back).toArray(function(err,logs){
                        if(!err){
                            for(var l in logs){
                                var log = logs[l];
                                if(log.from&&log.band){
                                    switch(log.from){
                                        //case 1:
                                        //    band_collection.kw += parseInt(log.band);
                                        //    band_collection.kwn += 1;
                                        //    break;
                                        case 2:
                                            if(config.dl_1_2.search(log.s_ip)!=-1){
                                            band_collection.dl += parseInt(log.band);
                                            }
                                            //band_collection.dln += 1;
                                            break;
                                        //case 3:
                                        //    band_collection.ws += parseInt(log.band);
                                        //    band_collection.wsn += 1;
                                        //    break;
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
exports.day_max = day_max
exports.level_1_2 = level_1_2