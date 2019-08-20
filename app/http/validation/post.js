var Joi = require('@hapi/joi');
var {errorHandler, throwError} = require("../handlers/error");
var Post = require('../../models/post');
var Asset = require('../../util/Asset');
var crypto = require('crypto');

var schema = Joi.object().keys({
    title: Joi.string().trim().max(50).required(),
    content: Joi.string().trim().max(250).required(),
});

exports.store = function (req, res, next) {
    try {

        var result = schema.validate(req.body); // result.error === null -> valid\

        if (result.error) {
            throwError(422, "Validation failed", result.error.details);
        }

        //Files should exist
        if (!req.files || req.files.length == 0) {
            throwError(422, "Validation failed", [{"message": "Files not found", "context": {"key": "files"}}]);
        }

        //Validate files
        for (let file of req.files) {
            if (file.mimetype != 'image/png' && file.mimetype != 'image/jpeg' && file.mimetype != 'video/mp4') {
                throwError(422, "Validation failed", [{
                    "message": `${file.originalname} can only be png,jpg or mp4`,
                    "context": {"key": 'files'}
                }])
            }
        }

        //build asset object
        var assets = [];
        for (let file of req.files) {
            const random = crypto.randomBytes(50).toString('hex');
            file.originalname = `${random}.${Asset.getExtFromFilename(file.originalname)}`; //Change original name so every file is uniquely named
            assets.push({
                type: file.mimetype,
                basename: Asset.getBaseNameFromFilename(file.originalname),
                size: file.size,
                ext: Asset.getExtFromFilename(file.originalname),
                filename: file.originalname
            })
        }

        //Success
        req.assets = assets;

    } catch (error) {
        return errorHandler(error, res);
    }

    next();

};

exports.post = async function (req, res, next) {
    try {

        var post = await Post.findOne({
            _id: req.params.post_id,
            creator: req.userId
        }).populate("creator");

        //Only user can access his posts
        if (!post) {
            throwError(404, "No records found");
        }
        req.post = post;

    } catch (error) {
        return errorHandler(error, res);
    }

    next();

};

exports.update = async function (req, res, next) {
    try {

        var result = schema.validate(req.body); // result.error === null -> valid
        if (result.error) {
            throwError(422, "Validation failed", result.error.details);
        }
        var post = await Post.findOne({
            _id: req.params.post_id,
            creator: req.userId
        });

        //Only user can access his posts
        if (!post) {
            throwError(404, "No records found");
        }

        req.post = post;

    } catch (error) {
        return errorHandler(error, res);
    }

    next();

};

exports.destroy = async function (req, res, next) {
    try {

        var post = await Post.findOne({
            _id: req.params.post_id,
            creator: req.userId
        });

        //Only user can access his posts
        if (!post) {
            throwError(404, "No records found");
        }

        //Success
        req.post = post;

    } catch (error) {
        return errorHandler(error, res);
    }

    next();

};

exports.addAsset = async function (req, res, next) {
    try {

        var post = await Post.findOne({
            _id: req.params.post_id,
            creator: req.userId
        });

        //Only user can access his posts
        if (!post) {
            throwError(404, "No records found");
        }

        //Max file limits = 5
        if (post.assets.length > 4) {
            throwError(422, "Validation failed", [{
                "message": "A post can only have 5 files",
                "context": {"key": "file"}
            }]);
        }

        //Check if file was passed in req
        if (!req.file) {
            throwError(422, "Validation failed", [{message: "File is required", context: {key: "file"}}]);
        }

        //File must be only png, jpeg
        if (req.file.mimetype != 'image/png' && req.file.mimetype != 'image/jpeg' && req.file.mimetype != 'video/mp4') {
            throwError(422, "Validation failed", [{
                message: `${req.file.originalname} can only be png,jpg or mp4`,
                context: {key: "file"}
            }]);
        }

        //build asset object
        const random = crypto.randomBytes(50).toString('hex');
        req.file.originalname = `${random}.${Asset.getExtFromFilename(req.file.originalname)}`; //Change original name so every file is uniquely named
        var asset = {
            type: req.file.mimetype,
            basename: Asset.getBaseNameFromFilename(req.file.originalname),
            size: req.file.size,
            ext: Asset.getExtFromFilename(req.file.originalname),
            filename: req.file.originalname,
        }

        //Success
        req.post = post;
        req.asset = asset;

    } catch (error) {
        return errorHandler(error, res);
    }

    next();

};

exports.removeAsset = async function (req, res, next) {
    try {

        var post = await Post.findOne({
            _id: req.params.post_id,
            creator: req.userId
        });

        //Only user can access his posts
        if (!post) {
            throwError(404, "No records found");
        }

        //1 file should always exist in post
        if (post.assets.length < 2) {
            throwError(400, "1 file is required for post");
        }

        var asset = post.getAsset(req.params.asset_id);

        if (asset == null) {
            throwError(404, 'File does not exist');
        }

        //success
        req.asset = asset;
        req.post = post;


    } catch (error) {
        return errorHandler(error, res);
    }

    next();
};