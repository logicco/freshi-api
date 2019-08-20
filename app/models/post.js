var mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

var postSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    assets: [
        {
            type: {
                type: String,
                required: true,
            },
            basename: {
                type: String,
                required: true,
            },
            size: {
                type: String,
                required: true,
            },
            ext: {
                type: String,
                required: true,
            },
            filename: {
                type: String,
                required: true,
            }
        },
    ],
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, { timestamps: true });

postSchema.plugin(mongoosePaginate);

postSchema.virtual('postedOn').get(function () {
    return this.createdAt.toLocaleDateString();
});

/**
 * Remove asset
 * @param assetId
 * @returns {Promise}
 */
postSchema.methods.removeAsset = async function(assetId) {
    this.assets = this.assets.filter((asset) => {
        return asset._id != assetId;
    })
    await this.save();
};

/**
 * Check if asset exists
 * @param assetId
 * @returns {boolean}
 */
postSchema.methods.assetExists = function(assetId) {
    this.assets.forEach((asset) => {
        if (asset._id == assetId){
            return true;
        }
    })
    return false;
};

/**
 * Get asset
 * @param assetId
 * @returns {asset,null}
 */
postSchema.methods.getAsset = function(assetId) {
    for (let asset of this.assets){
        if (asset._id == assetId){
            return asset;
        }
    }
    return null;
};

/**
 * Add asset
 * @param asset
 * @returns {Promise}
 */
postSchema.methods.addAsset = async function(asset) {
    this.assets.push(asset);
    await this.save();
};

/**
 * Get all urls of asset
 * @param postId
 * @returns {Array}
 */
postSchema.methods.getAssetsUrl = function(postId) {
    var urls = this.assets.map(function (asset) {
        return buildAssetAccessUrl(postId,asset);
    });
    return urls;
};

//Helpers
/**
 * Build access url of asset
 * @param postId
 * @param asset
 * @returns {string}
 */
function buildAssetAccessUrl(postId,asset) {
    return `${process.env.APP_BASE_URL}/api/assets/posts/${postId}/${asset.filename}`;
};

module.exports = mongoose.model("Post", postSchema);
