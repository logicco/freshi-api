/**
 * Get .ext from filename
 * @param filename
 * @returns {string}
 */
exports.getExtFromFilename = function (filename){
    return filename.substr(filename.lastIndexOf('.') + 1);
}

/**
 * Get basename of file
 * @param filename
 * @returns {string}
 */
exports.getBaseNameFromFilename = function (filename){
    return filename.split('.')[0];
}
