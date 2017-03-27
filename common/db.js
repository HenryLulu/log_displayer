var mongo = require("mongodb");

var config = require("../common/config");
var logger = require("../common/logger").logger;

var find = function(collection_name, query, back, cb){
    require('mongodb').MongoClient.connect(config.mongo_addr,config.mongo_option, function (err, db) {
            if(!err){
                db.collection(collection_name,function(err,tb){
                    if(!err){
                        tb.find(query,back).toArray(function(err,result){
                            if(!err){
                                cb(result)
                                db.close();
                            }else{
                                logger.error("102:Failed to get records")
                                cb({
                                    ErrNo:"102",
                                    ErrMsg:"Failed to get logs"
                                })
                            }
                        })
                    }else{
                        logger.error("101:Failed to get table")
                        cb({
                            ErrNo:"101",
                            ErrMsg:"Failed to get table"
                        })
                    }
                })
            }else{
                logger.error("100:Failed to connect database")
                cb({
                    ErrNo:"100",
                    ErrMsg:"Failed to connect database"
                })
            }
    })
}

module.exports = find