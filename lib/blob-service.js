var AWS = require('aws-sdk');
var url = require('url');
var config = require('clickberry-config');

var s3Client = new AWS.S3({
    accessKeyId: config.get('s3:key'),
    secretAccessKey: config.get('s3:secret')
});

exports.delete = function (video, callback) {
    var bucket = config.get('s3:bucket');

    var videoObjs = video.videos.map(function (item) {
        var parsedUrl = url.parse(item.uri);
        return {
            Key: parsedUrl.pathname.substr(1)
        };
    });

    var screenshotObjs = video.screenshots.map(function (item) {
        var parsedUrl = url.parse(item.uri);
        return {
            Key: parsedUrl.pathname.substr(1)
        };
    });

    var originalVideoObj = {
        Key: url.parse(video.uri).pathname.substr(1)
    };

    var objects = videoObjs.concat(screenshotObjs);
    objects.push(originalVideoObj);

    s3Client.deleteObjects({
        Bucket: bucket,
        Delete: {
            Objects: objects
        }
    }, function (err, data) {
        callback(err, data);
    });
};