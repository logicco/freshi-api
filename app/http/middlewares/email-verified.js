var User = require('../../models/user');
var { throwError, errorHandler } = require("../handlers/error");

module.exports = async (req, res, next) => {
  //Get user
  try {
    var user = await User.findById(req.userId);

    if(!user)
      throwError(401,'Unauthorized');

    if(!user.meta.emailVerified){
      throwError(403,'Please verify email')
    }
  }catch (error) {
    return errorHandler(error,res);
  }

  next();
};
