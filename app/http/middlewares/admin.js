var User = require('../../models/user');
var {throwError, errorHandler} = require("../handlers/error");

module.exports = async (req, res, next) => {
    try {
        //Get user
        var user = await User.findById(req.userId);

        if (!user) {
            throwError(401, "Unauthorized access");
        }

        if(!user.meta.admin){
            throwError(404, "Nothing here..");
        }

    } catch (error) {
        return errorHandler(error,res)
    }
    next();
};
