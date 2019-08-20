var AWS = require('aws-sdk');

AWS.config = new AWS.Config();
AWS.config.accessKeyId = process.env.AWS_ACCESS_KEY_ID;
AWS.config.secretAccessKey = process.env.AWS_SECRET_KEY;
AWS.config.region = process.env.AWS_REGION;

var S3Connection = new AWS.S3();

module.exports = S3Connection;