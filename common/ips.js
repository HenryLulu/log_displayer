/**
 * Created by Henry on 17/2/7.
 */
var http = require('http');
var exec = require('child_process').exec;
var config = require("../common/config");

function to_array(data){
    return data.match(/\d+\.\d+\.\d+\.\d+/g)||[]
}
var get = function(cb){
    var result
    var kw = []
    var dl = []
    var ws = []
    var pbs = []
    http.get(config.kw_url,function(res){
        var data = ""
        res.on("data",function(d){
            data += d
        })
        res.on("end",function(){
            kw = to_array(data)
        })
    }).on("error", function(e) {
        kw = []
    });
    http.get(config.dl_url,function(res){
        var data = ""
        res.on("data",function(d){
            data += d
        })
        res.on("end",function(){
            dl = to_array(data)
        })
    }).on("error", function(e) {
        dl = []
    });
    cmdstr = "DATE=`date -R -u | awk '"+
            '{print $1" "$2" "$3" "$4" "$5" GMT"}'+
            "'`\nPASSWD=$(echo -en ${DATE} | openssl dgst -sha1 -hmac abc123456 -binary | openssl enc -base64)\ncurl -k --url 'https://open.chinanetcenter.com/c/51321/report/serverList' -X GET -u cntv_hds:$PASSWD -H "+
            '"Date: $DATE"'
    exec(cmdstr, function(err,stdout,stderr){
        if(err) {
            ws = []
        } else {
            ws = to_array(stdout)
        }
    });

    http.get(config.dl_url,function(res){
        var data = ""
        res.on("data",function(d){
            data += d
        })
        res.on("end",function(){
            pbs = to_array(data)
        })
    }).on("error", function(e) {
        pbs = []
    });

    var times = 0
    var int = setInterval(function(){
        times ++
        if((kw.length>0&&dl.length>0&&ws.length>0&&pbs.length>0)||times>50){
            clearInterval(int)
            cb({
                kw:kw,
                dl:dl,
                ws:ws,
                pbs:pbs
            })
        }
    },100)
}

exports.get = get