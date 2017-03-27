/**
 * Created by Henry on 16/12/7.
 */
var express = require('express');
var router = express.Router();

var api = require('../api/index')

router.get('/get_regular_programs_status',api.get_regular_programs_status)

module.exports = router