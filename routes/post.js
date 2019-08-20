//Express.js
var express = require("express");
var router = express.Router();

//Util packages
var multer = require('multer');

//Middlewares
var mongooseSanitizeIdMiddleware = require('../app/http/middlewares/mongoose-sanitize-param-ids');

//Validations
var postValidation = require('../app/http/validation/post');

//Controllers
var postController = require("../app/http/controllers/post");

//Protected: auth, email
router.get("/", postController.posts);
router.post("/", multer({limits: {fileSize: 2097152}}).array('files', 5), postValidation.store, postController.store)

//Protected: auth, email, sanitizeId
router.get('/:post_id', mongooseSanitizeIdMiddleware, postValidation.post, postController.post);
router.put('/:post_id', mongooseSanitizeIdMiddleware, postValidation.update, postController.update);
router.delete('/:post_id', mongooseSanitizeIdMiddleware, postValidation.destroy, postController.destroy);
router.post('/:post_id/add-asset', multer({limits: {fileSize: 2097152}}).single('file'), mongooseSanitizeIdMiddleware, postValidation.addAsset, postController.addAsset);
router.delete('/:post_id/remove-asset/:asset_id', mongooseSanitizeIdMiddleware, postValidation.removeAsset, postController.removeAsset);

module.exports = router;
