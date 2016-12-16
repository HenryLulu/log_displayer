/**
 * Created by Henry on 16/12/7.
 */
var express = require('express');
var router = express.Router();

var summary = require('../api/summary')

router.post('/test',function(req,res){
    console.log("here");
    res.json({});
})
router.post('/last_five_minutes',summary.last_five)
router.get('/complete_ips',summary.complete)

module.exports = router