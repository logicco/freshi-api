var express = require('express');
var router = express.Router();
var multer = require('multer');

var adminValidation = require('../app/http/validation/admin')

var adminController = require('../app/http/controllers/admin');

//Protected: auth, email, admin
router.get('/test', adminController.test);
router.post('/upload/file/public',multer({limits: {fileSize: 2097152}}).single('file'),adminValidation.uploadPublicFile, adminController.uploadPublicFile);

module.exports = router;