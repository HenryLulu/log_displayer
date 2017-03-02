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

var last_min = function(req,res){
    try{
        connect_mongo(res,function(db){
            db.collection('log_table',function(err,tb){
                if(!err){
                    var start = moment().subtract(2,"minutes").unix()
                    //var five_ago = new Date(new Date().getTime()-120000);
                    //var start = parseInt(
                    //    new Date(five_ago.getFullYear(),five_ago.getMonth(),five_ago.getDate(),five_ago.getHours(),
                    //    five_ago.getMinutes(),0).getTime()/1000
                    //)

                    var query = {
                        'start':start
                    }
                    var back = {
                        start:1,
                        s_ip:1,
                        flu:1,
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
                        var start = moment().subtract(1,"minutes").unix();
                        //var five_ago = new Date(new Date().getTime()-300000);
                        //var start = parseInt(
                        //    new Date(five_ago.getFullYear(),five_ago.getMonth(),five_ago.getDate(),five_ago.getHours(),
                        //        parseInt(five_ago.getMinutes()/5)*5,0).getTime()/1000
                        //)
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
                                var cdns = {
                                    kw:{
                                        list:"",
                                        ips:ip_obj.kw,
                                        num:0
                                    },
                                    dl:{
                                        list:"",
                                        ips:ip_obj.dl,
                                        num:0
                                    },
                                    ws:{
                                        list:"",
                                        ips:ip_obj.ws,
                                        num:0
                                    },
                                    pbs:{
                                        list:"",
                                        ips:ip_obj.pbs,
                                        num:0
                                    },
                                }
                                var current_cdn;
                                var current_re;
                                var current_ip;
                                var ips = ""
                                var total_list = "";
                                for(var l in logs){
                                    logs[l].s_ip && (ips += (logs[l].s_ip+":"+(logs[l].version||"unk")+":"+(logs[l].md5||"unk")+","))
                                }

                                for(var cdn_name in cdns){
                                    current_cdn = cdns[cdn_name];
                                    for(var i in current_cdn.ips){
                                        current_ip = current_cdn.ips[i];
                                        current_re = ips.match(new RegExp(current_ip+":[^:]*:[^:]*,"));
                                        if(current_re){
                                            current_cdn.list += "<p style='color: green'>"+current_re[0]+"</p>"
                                            current_cdn.num ++;
                                        }else{
                                            current_cdn.list += "<p style='color: red'>"+current_ip+"</p>"
                                        }
                                    }
                                    current_cdn.list = "<p>["+cdn_name+" total:"+current_cdn.num+"/"+current_cdn.ips.length+"]</p>" + current_cdn.list;
                                    total_list += (current_cdn.list+"<p></p>")
                                }
                                res.send(total_list)
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
                        start = moment().subtract().unix()
                        //var five_ago = new Date(new Date().getTime()-300000);
                        //start = parseInt(
                        //    new Date(five_ago.getFullYear(),five_ago.getMonth(),five_ago.getDate(),five_ago.getHours(),
                        //        parseInt(five_ago.getMinutes()/5)*5,0).getTime()/1000
                        //)
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
                        "pbs":0,
                        "kwn":0,
                        "dln":0,
                        "wsn":0,
                        "pbsn":0
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
                                        case 4:
                                            band_collection.pbs += parseInt(log.band);
                                            band_collection.pbsn += 1;
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
                    var datestr = req.query.date || moment.utc().utcOffset(8).format('YYYYMMDD');
                    var date = moment.utc(datestr).utcOffset(8);
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
                        "ws":{},
                        "pbs":{}
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
                        pbs:{
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
                                            if(!band_collection.kw[log.start]){band_collection.kw[log.start]=0}
                                            band_collection.kw[log.start] += parseInt(log.band);
                                            break;
                                        case 2:
                                            if(!band_collection.dl[log.start]){band_collection.dl[log.start]=0}
                                            band_collection.dl[log.start] += parseInt(log.band);
                                            break;
                                        case 3:
                                            if(!band_collection.ws[log.start]){band_collection.ws[log.start]=0}
                                            band_collection.ws[log.start] += parseInt(log.band);
                                            break;
                                        case 4:
                                            if(!band_collection.pbs[log.start]){band_collection.pbs[log.start]=0}
                                            band_collection.pbs[log.start] += parseInt(log.band);
                                            break;
                                    }
                                }
                            }
                            for(var cdn in band_collection){
                                var band_m = 0,time_max = ""
                                var current_cdn = band_collection[cdn];
                                for(var five_min in current_cdn){
                                    if(current_cdn[five_min]>band_m){
                                        band_m = current_cdn[five_min];
                                        time_max = five_min;
                                    }
                                }
                                band_max[cdn].band = band_m;
                                band_max[cdn].time = moment.unix(parseInt(time_max)).utc().utcOffset(8).format("MM-DD HH:mm")
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
                        start = moment().subtract().unix()
                        //var five_ago = new Date(new Date().getTime()-300000);
                        //start = parseInt(
                        //    new Date(five_ago.getFullYear(),five_ago.getMonth(),five_ago.getDate(),five_ago.getHours(),
                        //        parseInt(five_ago.getMinutes()/5)*5,0).getTime()/1000
                        //)
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
exports.last_five = last_min
exports.complete = complete
exports.get_time = get_time
exports.test = test
exports.cdn_band = cdn_band
exports.day_max = day_max
exports.level_1_2 = level_1_2