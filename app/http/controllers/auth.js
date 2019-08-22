//Models
var User = require("../../models/user");

//Handlers
var {errorHandler, throwError} = require("../handlers/error");
var emailHandler = require("../handlers/email");

//API resources
var userResource = require('../resources/user');

//Util packages
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var crypto = require("crypto");

//utils
var Token = require("../../util/token");

/**
 * Test auth endpoint
 * @param req
 * @param res
 * @returns { Response }
 */
exports.test = async (req, res) => {
    return res.status(200).json({
        message: 'Ok'
    });
};

/**
 * Get information about currently logged in user
 * @param req
 * @param res
 * @returns { Response }
 */
exports.me = async function showLoggedInUserData(req, res) {
    try {
        var user = await User.findById(req.userId);
        res.status(200).json(userResource.single(user));
    } catch (error) {
        return errorHandler(error, res);
    }
};

/**
 * Register user
 * @param req
 * @param res
 * @returns { Response }
 */
exports.register = async function registerUser(req, res) {
    try {

        var user = new User({
            username: req.body.username,
            email: req.body.email,
            password: await bcrypt.hash(req.body.password, 12),
            meta: {
                emailVerificationToken: await crypto.randomBytes(30).toString("hex"),
                emailVerificationTokenExp: Token.generateSafeExpDate(60) //expires in 5 mins
            }
        });

        await user.save();

        //send email to verify email
        await emailHandler.sendEmailAuthenticationEmail(
            user.email,
            user.meta.emailVerificationToken
        );

        res.status(201).json({
            message: `Welcome ${user.username}, Please verify email`,
            user: userResource.single(user)
        });

    } catch (error) {
        return errorHandler(error, res);
    }
};

/**
 * Login user
 * @param req
 * @param res
 * @returns { Response }
 */
exports.login = async function loginUser(req, res) {
    try {

        var user = req.user;

        const token = jwt.sign(
            {
                userId: user._id.toString(),
                admin: user.meta.admin
            },
            process.env.JWT_SECRET,
            {expiresIn: "1h"}
        );

        res.status(200).json({
            message: "Success",
            user: userResource.single(user),
            token: token
        });
    } catch (error) {
        return errorHandler(error, res);
    }
};

/**
 * Resend email to verify users email
 * @param req
 * @param res
 * @returns { Response }
 */
exports.resendEmailVerificationEmail = async function resendEmailToVerifyEmail(req, res)  {
    try {
        //Get user
        var user = await User.findById(req.userId);

        if (!user) {
            throwError(500, "Internal error occurred");
        }

        if (user.meta.emailVerified) {
            throwError(401, "Email already verified");
        }

        //Reset token and expiry date
        user.meta.emailVerificationToken = await crypto.randomBytes(30).toString("hex");
        user.meta.emailVerificationTokenExp = Token.generateSafeExpDate(60); //expires in 60 mins

        await user.save();

        //Send email
        await emailHandler.sendEmailAuthenticationEmail(
          user.email,
          user.meta.emailVerificationToken
        );

        //Success
        res.status(200).json({
            message: "Email successfully sent."
        });

    } catch (error) {
        return errorHandler(error, res);
    }
};

/**
 * Verify users email
 * @param req
 * @param res
 * @returns { Response }
 */
exports.verifyEmail = async function verifyTokenInEmail (req, res) {
    try {

        if (!req.params.email || !req.params.token)
            throwError(401, 'Unauthorized');

        //Find user
        var user = await User.findOne({email: req.params.email});

        if (!user)
            throwError(401, 'Unauthorized');

        if (user.meta.emailVerified)
            throwError(401, 'Email already verified');

        if (
            !Token.match(req.params.token, user.meta.emailVerificationToken) ||
            Token.isExpired(new Date(user.meta.emailVerificationTokenExp))) {
            throwError(401, "This request has expired");
        }

        user.meta.emailVerified = true;

        await user.save();

        //Success
        res.status(200).json({
            message: "Email successfully verified."
        });

    } catch (error) {
        return errorHandler(error, res);
    }

};