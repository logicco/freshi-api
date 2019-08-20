//Models
var Post = require("../../models/post");

//Handlers
var {errorHandler} = require("../handlers/error");

//API resources
var postResource = require('../resources/post')

//Util helpers
var S3Connection = require('../../util/S3Connection')
var S3 = require('../../util/S3');

const BUCKETNAME = process.env.AWS_BUCKET;

/**
 * Get all posts
 * @param req
 * @param res
 * @returns {Response}
 */
exports.posts = async function getAllPosts(req, res) {
    try {
        var posts = await Post.paginate({}, {limit: 2, page: req.query.page ,populate: 'creator', customLabels: {docs: 'collection'}});
        return res.status(200).json({
            posts: postResource.collection(posts),
            meta: postResource.paginateData(posts)
        });
    } catch (error) {
        return errorHandler(error, res);
    }
};

/**
 * Create post
 * @param req
 * @param res
 * @returns {Response}
 */
exports.store = async function createPost(req, res) {
    try {

        var post = new Post({
            title: req.body.title,
            content: req.body.content,
            assets: req.assets,
            creator: req.userId
        });

        //Upload files
        for (let file of req.files) {

            const params = {
                Bucket: BUCKETNAME,
                Key: `assets/posts/${post._id}/${file.originalname}`,
                Body: file.buffer,
                Metadata: {
                    'Content-Type': file.mimetype
                }
            };

            await S3Connection.putObject(params).promise(); //Upload file

            await post.save(); //Create post

            await post.populate("creator").execPopulate()

        }

        //Success
        res.status(201).json(postResource.single(post));

    } catch (error) {
        return errorHandler(error, res);
    }
};

/**
 * Get single post
 * @param req
 * @param res
 * @returns {Response}
 */
exports.post = async function getPost(req, res) {
    try {
        //Success
        res.status(200).json(postResource.single(req.post));

    } catch (error) {
        return errorHandler(error, res);
    }

};

/**
 * Edit post
 * @param req
 * @param res
 * @returns {Response}
 */
exports.update = async function editPost(req, res) {
    try {

        var post = req.post;
        post.title = req.body.title;
        post.content = req.body.content;

        await post.save(); //Save changes

        await post.populate("creator").execPopulate()

        res.status(200).json(postResource.single(post));

    } catch (error) {
        return errorHandler(error, res);
    }
};

/**
 * Delete post
 * @param req
 * @param res
 * @returns {Response}
 */
exports.destroy = async function deletePost(req, res) {
    try {

        var post = req.post;

        await S3.emptyS3Directory(`assets/posts/${post._id}`);//Delete all images in post

        await post.delete();//Delete post

        //Success
        res.status(200).json({
            message: "Post has been deleted",
            deletedPost: postResource.single(post)
        });

    } catch (error) {
        return errorHandler(error, res);
    }

};

/**
 * Add asset to post
 * @param req
 * @param res
 * @returns {Response}
 */
exports.addAsset = async function addAssetToPost(req, res) {
    try {

        var post = req.post;
        var asset = req.asset;

        const params = {
            Bucket: BUCKETNAME,
            Key: `assets/posts/${post._id}/${asset.filename}`,
            Body: req.file.buffer,
            Metadata: {
                'Content-Type': req.file.mimetype
            }
        };

        await S3Connection.putObject(params).promise(); //upload file

        await post.addAsset(asset);//Add asset to db

        //Success
        res.status(201).json({
            'message': `${asset.basename}.${asset.ext} has been uploaded`
        });

    } catch (error) {
        return errorHandler(error, res);
    }
}

/**
 * Remove asset from post
 * @param req
 * @param res
 * @returns {Response}
 */
exports.removeAsset = async function removeAssetFromPost(req, res) {
    try {

        var asset = req.asset;
        var post = req.post;

        var params = {
            Bucket: BUCKETNAME,
            Key: `assets/posts/${post._id}/${asset.filename}`
        };

        await S3Connection.deleteObject(params).promise();//Delete file from s3

        await post.removeAsset(asset._id);//Delete asset from db

        //Success
        res.status(200).json({
            message: `${asset.filename} has been deleted`
        });

    } catch (error) {
        return errorHandler(error, res);
    }

};