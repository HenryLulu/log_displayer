/**
 * Created by Henry on 16/12/7.
 */
var express = require('express');
var router = express.Router();

var summary = require('../api/summary')

router.post('/last_five_minutes',summary.last_five)
router.get('/complete_ips',summary.complete)
router.get('/get_time',summary.get_time)
router.get('/test',summary.test)
router.get('/get_cdn_band',summary.cdn_band)
router.get('/daily_max',summary.day_max)
router.get('/level_1_2',summary.level_1_2)

module.exports = router