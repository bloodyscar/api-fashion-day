var express = require('express');
var router = express.Router();
const { getBestToday, uploadFile } = require('./controller');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

/* GET home listing. */
router.get('/', upload.single('file'), uploadFile);

/* GET home listing. */
router.get('/best-today', getBestToday);

module.exports = router;
