var express = require("express");
var app = express();
var helmet = require('helmet');
var cors = require('cors');
var bodyParser = require("body-parser");
require("dotenv").config();

var mongoose = require("mongoose");

var {multerErrorHandler} = require('./app/http/handlers/error');

//Middlewares
var authMiddleware = require('./app/http/middlewares/auth');
var verifiedEmailMiddleware = require('./app/http/middlewares/email-verified');
var adminMiddleware = require('./app/http/middlewares/admin');

//Routes
var postRoutes = require("./routes/post");
var authRoutes = require('./routes/auth');
var adminRoutes = require('./routes/admin')
var mediaManagerRoutes = require('./routes/media-manager');

app.use(helmet()); //Add secure headers
app.use(cors()); //Add cors middleware for REST API
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);//Auth routes
app.use("/api/posts", authMiddleware, verifiedEmailMiddleware, postRoutes);//Post routes
app.use('/api/admin', authMiddleware, verifiedEmailMiddleware, adminMiddleware, adminRoutes);//Admin routes
app.use('/api', mediaManagerRoutes);//File access routes

//Override default express error handler
app.get('*', function (req, res) {
    return res.status(404).json({message: "No such endpoint exists"});
});

//unhandled errors
app.use((err, req, res, next) => {
    //Multer errors
    if (err.name == 'MulterError') {
        return multerErrorHandler(err, res);
    }

    //Unhandled errors
    if (process.env.MODE == 'DEV') {
        return res.status(500).json({err: err});
    } else {
        return res.status(500).json({message: 'Internal server error occurred'});
    }
});

//Connect to db
mongoose
    .connect(
        `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_DEFAULT_HOST_NAME}/${process.env.DB_DEFAULT_DB_NAME}`
    )
    .then(() => {
        app.listen(process.env.PORT || 8080)
    })
    .catch(() => {
        console.log("Could not connect to database");
        process.exit(1);
    });
