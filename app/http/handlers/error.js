/**
 * Returns error response
 * @param error
 * @param res
 * @returns {Response}
 */
exports.errorHandler = (error, res) => {
  var status = error.statusCode || 500;
  if(process.env.MODE == 'PROD'){
    if (status === 500) {
      error.message = "Internal server error";
    }
  }
  return res.status(status).json({
    message: error.message,
    errors: error.data
  })
};

/**
 * Throw error
 * @param statusCode
 * @param message
 * @param data
 */
exports.throwError = (statusCode,message,data) => {
  var error = new Error(message);
  error.statusCode = statusCode;
  if (data){
    error.data = data;
  }
  throw error;
};

/**
 *
 * @param error
 * @param res
 * @returns {void,Response}
 */
exports.multerErrorHandler = function (error,res) {
  if (error.code == "LIMIT_UNEXPECTED_FILE") {
    return res.status(422).json({
      "message": "File selection limit exceeded",
      "context": {
        "key": error.field
      }
    });
  }else if (error.code == "LIMIT_FILE_SIZE"){
    return res.status(422).json({
      "message": "A single file cannot be more than 2 mb",
      "context": {
        "key": error.field
      }
    });
  }
}