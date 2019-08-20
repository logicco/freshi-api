var {errorHandler, throwError} = require("../handlers/error");
var S3Connection = require('../../util/S3Connection');
var Asset = require('../../util/Asset');

const bucketName = process.env.AWS_BUCKET

/**
 * Test endpoint
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.test = async function testEndpoint(req, res) {
    res.status(200).json({
        message: "Ok"
    });
};

/**
 * Upload file in public dir
 * @param req
 * @param res
 * @returns {Promise<Response>}
 */
exports.uploadPublicFile = async function uploadFileToPublicDir(req, res) {
    try {

        const params = {
            Bucket: bucketName,
            Key: `assets/public/${req.body.fileBasename}.${Asset.getExtFromFilename(req.file.originalname)}`,
            Body: req.file.buffer,
            Metadata: {
                'Content-Type': req.file.mimetype
            }
        };

        //Try to upload file
        S3Connection.putObject(params, function (err) {
            if (err) {
                throwError(422, 'Failed to upload file')
            } else {
                //Success
                res.status(200).json({
                    message: "File successfully uploaded"
                });
            }
        });

    } catch (error) {
        return errorHandler(error, res);
    }

};
