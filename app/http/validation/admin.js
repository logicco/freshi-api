var Joi = require('@hapi/joi');
var {errorHandler, throwError} = require("../handlers/error");
var S3 = require('../../util/S3');
var Asset = require('../../util/Asset');

exports.uploadPublicFile = async function (req, res, next) {
    try {
        const schema = Joi.object().keys({
            fileBasename: Joi.string().trim().max(12).required()
        });

        var result = schema.validate({fileBasename: req.body.fileBasename}); // result.error === null -> valid
        if (result.error) {
            throwError(422, "Validation failed", result.error.details)
        }

        //Check if file was passed in req
        if (!req.file) {
            //throwError(422,"Validation failed",[{message:"",context:{key:""}}])
            throwError(422, "Validation failed", [{message: "File is required", context: {key: "file"}}])
        }

        //File must be only png, jpeg
        if (req.file.mimetype != 'image/png' && req.file.mimetype != 'image/jpeg' && req.file.mimetype != 'video/mp4') {
            throwError(422, "Validation failed", [{
                message: "File can only be png, jpg or mp4",
                context: {key: "file"}
            }]);
        }

        //Check if file exists
        var imageExists = await S3.fileExists(`assets/public/${req.body.fileBasename}.${Asset.getExtFromFilename(req.file.originalname)}`); //bool

        if (imageExists) {
            throwError(422, "Validation failed", [{message: "File already exists", context: {key: "file"}}])
        }


    } catch (error) {
        return errorHandler(error, res);
    }
    next();
};


