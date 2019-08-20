var User = require('../../models/user');
var Joi = require('@hapi/joi');
var {errorHandler, throwError} = require("../handlers/error");
var bcrypt = require("bcryptjs");

exports.register = async function(req, res, next){
    try {
        const schema = Joi.object().keys({
            username: Joi.string().trim().alphanum().min(3).max(30).required(),
            email: Joi.string().trim().email().required(),
            password: Joi.string().trim().min(7).max(22).required(),
        });

        var result = schema.validate(req.body); // result.error === null -> no error
        if (result.error) {
            throwError(422, "Validation failed", result.error.details);
        }

        //Check if email already exists
        var emailExists = await User.findOne({email: req.body.email}); //findOne returns user obj's, null -> not found
        //check if username already exists
        var usernameExists = await User.findOne({username: req.body.username});

        if (emailExists) {
            throwError(422, "Validation failed", [{
                message: `${req.body.email} already exists`,
                context: {key: "email"}
            }]);
        }

        if (usernameExists) {
            throwError(422, "Validation failed", [{
                message: `${req.body.username} already exists`,
                context: {key: "username"}
            }]);
        }

    } catch (error) {
        return errorHandler(error, res);
    }
    next();
};

exports.login = async function(req, res, next){
    try {
        const schema = Joi.object().options({abortEarly: true}).keys({
            email: Joi.string().trim().email().required(),
            password: Joi.string().trim().required()
        });

        var result = schema.validate(req.body); // result.error === null -> no error
        if (result.error) {
            throwError(422, "Validation failed", result.error.details);
        }

        var user = await User.findOne({email: req.body.email});

        //user email does not exist
        if (!user) {
          throwError(422,"Validation failed",[{message:`${req.body.email} does not exist`,context:{key:"email"}}]);
        }

        var passwordMatch = await bcrypt.compare(req.body.password, user.password); //bool

        //passwords do not match
        if (!passwordMatch) {
          throwError(422,"Validation failed",[{message:"Incorrect password",context:{key:"password"}}]);
        }

        req.user = user;

    } catch (error) {
        return errorHandler(error, res);
    }
    next();
};


