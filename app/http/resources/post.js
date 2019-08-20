/**
 * Show necessary post data
 * @param post
 * @returns {{creator: *, assets: *, postedOn: *, id: *, title: *, content: *}}
 */
function single(post) {
    return {
        id: post.id,
        title: post.title,
        content: post.content,
        postedOn: post.createdAt.toLocaleString(),
        creator: post.creator.username,
        assets: post.getAssetsUrl(post.id),
    }
}

/**
 * Show necessary post collection data
 * @param posts
 * @returns {Object}
 */
function collection(posts) {
    return posts.collection.map(function (post) {
        return single(post);
    })
}

/**
 * Show post paginate meta data
 * @param posts
 * @returns {{hasPrevPage: *, offset: *, hasNextPage: *, pagingCounter: *, nextPage: *, limit: *, totalPages: *, prevPage: *, page: *, totalDocs: *}}
 */
function paginateData(posts) {
    return {
        totalDocs: posts.totalDocs,
        limit: posts.limit,
        offset: posts.offset,
        hasPrevPage: posts.hasPrevPage,
        hasNextPage: posts.hasNextPage,
        page: posts.page,
        totalPages: posts.totalPages,
        pagingCounter: posts.pagingCounter,
        prevPage: posts.prevPage,
        nextPage: posts.nextPage
    }
};

module.exports = {
    single,
    collection,
    paginateData
}
