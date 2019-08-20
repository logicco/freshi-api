var mongoose = require('mongoose');
var {throwError, errorHandler} = require('../handlers/error');

module.exports = (req, res, next) => {
    try {
        var paramKeys = Object.keys(req.params);
        var validKeys = paramKeys.filter(function (key) {
            var validKey = key.substr(key.lastIndexOf('_') + 1);
            return validKey == 'id';
        })
        for (let key of validKeys) {
            if (!req.params[key] || !mongoose.Types.ObjectId.isValid(req.params[key])) {
                throwError(404, 'No records found...');
            }
        }

    } catch (error) {
        return errorHandler(error, res);
    }
    next();
}