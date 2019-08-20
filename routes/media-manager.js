var express = require('express');
var router = express.Router();

//Middlewares
var authMiddleware = require('../app/http/middlewares/auth');
var verifiedEmailMiddleware = require('../app/http/middlewares/email-verified');

var mediaManager = require('../app/http/controllers/media-manager');

//Public
router.get('/public/assets/:filename',mediaManager.getPublicFile);

//Protected: auth, email
router.get('/assets/*',authMiddleware,verifiedEmailMiddleware,mediaManager.getPrivateFile);

module.exports = router;