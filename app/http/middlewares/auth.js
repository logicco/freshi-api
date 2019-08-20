var jwt = require("jsonwebtoken");
var { throwError,errorHandler } = require("../handlers/error");

module.exports = async (req, res, next) => {
  try {
    if (!req.get("Authorization")) {
      throwError(401, "Unauthorized access");
    }
    const token = req.get("Authorization").split(" ")[1];

    var decodedToken;
    try {
       decodedToken = await jwt.verify(token, process.env.JWT_SECRET);
    }catch (e) {
      throwError(401, "Unauthorized access");
    }

    if (!decodedToken) {
      throwError(401, "Unauthorized access");
    }
  }catch (error) {
    return errorHandler(error,res);
  }

  //Success
  req.userId = decodedToken.userId;

  next();
};
