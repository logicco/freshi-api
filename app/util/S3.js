var s3 = require('./S3Connection');

const BUCKETNAME = process.env.AWS_BUCKET

/**
 * Check if file exists
 * @param path
 * @returns {Promise<boolean>}
 */
exports.fileExists = async function (path) {
    try {

        var params = {
            Bucket: BUCKETNAME,
            Key: path //if any sub folder-> path/of/the/folder.ext
        }

        await s3.headObject(params).promise();

        return true;

    } catch (err) {
        return false;
    }

};

/**
 * Delete directory and all of its inner content
 * @param dir
 * @returns {Promise}
 */
exports.emptyS3Directory = async function (dir) {
    try {

        const listParams = {
            Bucket: BUCKETNAME,
            Prefix: dir
        };

        const listedObjects = await s3.listObjectsV2(listParams).promise();

        if (listedObjects.Contents.length === 0) return;

        const deleteParams = {
            Bucket: BUCKETNAME,
            Delete: {Objects: []}
        };

        listedObjects.Contents.forEach(({Key}) => {
            deleteParams.Delete.Objects.push({Key});
        });

        await s3.deleteObjects(deleteParams).promise();

        if (listedObjects.IsTruncated) await emptyS3Directory(dir);

    } catch (error) {
        throw error;
    }

}
