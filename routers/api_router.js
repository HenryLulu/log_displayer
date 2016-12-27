/**
 * Created by Henry on 16/12/7.
 */
var express = require('express');
var router = express.Router();

var summary = require('../api/summary')

router.post('/last_five_minutes',summary.last_five)
router.get('/complete_ips',summary.complete)
router.get('/get_time',summary.get_time)

module.exports = router