var moment = require("moment");

var check_mongo = require('../common/db');
var logger = require("../common/logger").logger;

var programs_list = {
    xwlb:[{
        channel:'cctv1',
        repeat:[true,true,true,true,true,true,true],    //周时间表（周日第一）
        time:['19:00-30']       //时间-分钟数
    },{
        channel:'cctv13',
        repeat:[true,true,true,true,true,true,true],
        time:['12:00-30','19:00-30']
    }]
};

var get_rule = function(program_name,duration){
    var program = programs_list[program_name];
    var rule = [];
    program.forEach(function(channel_time){     //一个频道
        var cursor = moment().utc().utcOffset(8);     //time游标扫描范围内每个分钟
        cursor.second(0);
        var days = duration;
        var current_times = [];
        while(days>0){      //一天
            console.log(days)
            days--;
            cursor.subtract(1,'days');
            if(!channel_time.repeat[cursor.day()]){
                continue;
            }
            channel_time.time.forEach(function(time){       //一个时间段
                cursor.hour(parseInt(time.substr(0,2))-1);
                cursor.minute(parseInt(time.substr(3,5)));
                var minutes = parseInt(time.substr(6));
                while(minutes>0){
                    minutes--;
                    cursor.subtract(1,'minutes');
                    current_times.push(cursor.unix());
                }
            })
        }

        rule.push({
            channel:channel_time.channel,
            times:current_times
        })
    })

    return rule
}

var get = function(req,res){
    var program_name = req.query.p||'xwlb';
    var duration = req.query.d||'10';

    if(!program_name in programs_list){
        res.json({
            ErrNo:'200',
            ErrMsg:'Program not found'
        })
    }
    var rule = get_rule(program_name,parseInt(duration));
    res.json(rule)

    // check_mongo('ori_node',{start:1490336340},{},function(mongo_res){
        
    // })
}

module.exports = get