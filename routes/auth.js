//Express.js
var express = require("express");
var router = express.Router();
//Middlewares
var authMiddleware = require('../app/http/middlewares/auth');
var emailVerifiedMiddleware = require('../app/http/middlewares/email-verified');
var webMiddleware = require('../app/http/middlewares/web');
//Validations
var authValidation = require('../app/http/validation/auth');
//Controllers
var authController = require("../app/http/controllers/auth");

//Public
router.get('/test',authController.test);
router.get('/verify/:email/:token',authController.verifyEmail);

//Protected: web
router.post('/register',webMiddleware,authValidation.register,authController.register);
router.post('/login',webMiddleware,authValidation.login,authController.login);

//Protected: auth
router.post('/resend-email-verification-email',authMiddleware,authController.resendEmailVerificationEmail);

//Protected: auth, email
router.get('/me',authMiddleware,emailVerifiedMiddleware,authController.me);


module.exports = router;