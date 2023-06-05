var express = require('express');
var router = express.Router();
const { getBestToday, homeFashion } = require('./controller');

/* GET home listing. */
router.get('/', homeFashion);

/* GET home listing. */
router.get('/best-today', getBestToday);

module.exports = router;
