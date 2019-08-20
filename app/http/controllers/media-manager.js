var {errorHandler, throwError, errorHandlerMiddleware} = require("../handlers/error");
var S3Connection = require('../../util/S3Connection');

const BUCKETNAME = process.env.AWS_BUCKET;

/**
 * Get public file
 * @param req
 * @param res
 * @returns {Response}
 */
exports.getPublicFile = async (req, res) => {
    try {

        if (!req.params.filename) {
            throwError('404', 'please provide filename');
        }

        var params = {Bucket: BUCKETNAME, Key: `assets/public/${req.params.filename}`};
        var result = await S3Connection.getObject(params).promise();

        //We only allow files, not directories
        if (result.ContentType != 'application/octet-stream') {
            throwError(404, "file not found");
        }

        //Success
        var file = result.Body;
        res.writeHead(200, {'Content-Type': result.Metadata["content-type"]});
        res.write(file, 'binary');
        res.end(null, 'binary');


    } catch (error) {
        return errorHandler(error, res);
    }
};

/**
 * Get any non-public file
 * @param req
 * @param res
 * @returns {Response}
 */
exports.getPrivateFile = async (req, res) => {
    try {
        if (!req.params[0]) {
            throwError(404, "no path specified");
        }

        var params = {Bucket: BUCKETNAME, Key: `assets/${req.params[0]}`};
        var result = await S3Connection.getObject(params).promise();

        //We only allow files, not directories
        if (result.ContentType != 'application/octet-stream') {
            throwError(404, "file not found");
        }

        //Success
        var file = result.Body;
        res.writeHead(200, {'Content-Type': result.Metadata["content-type"]});
        res.write(file, 'binary');
        res.end(null, 'binary');

    } catch (error) {
        return errorHandler(error, res);
    }
};

