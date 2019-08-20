var { throwError,errorHandler } = require("../handlers/error");

module.exports = function (req, res, next) {
    try {
        if (req.get('Authorization')){ //if authorization header is present
            throwError(401,'You are already logged in');
        }

        if (req.userId){ //req.userId is set when user is logged in
            throwError(401,'You are already logged in');
        }

    }catch (error) {
        return errorHandler(error,res);
    }

    //success
    next();

}