var error=require('clickberry-http-errors');
var request = require('request');
var config = require('../config');

exports.upload = function (file, filename, contentLength, quality, callback) {
    var formData = {
        method: 'POST',
        preambleCRLF: true,
        postambleCRLF: true,
        uri: config.get('encoder:uri'),
        formData: {
            video: {
                value: file,
                options: {
                    knownLength: contentLength,
                    filename: filename
                }
            },
            Qualities: quality,
            Formats: ['WebM', 'Mp4']
        }
    };

    console.log(quality);
    request(formData, function (err, response, body) {
        if (err) {
            return callback(err);
        }

        console.log(response.statusCode);
        console.log(!response || response.statusCode >= 400);
        if (!response || response.statusCode >= 400) {
            return callback(new error.BadRequest());
        }

        callback(err, JSON.parse(body));
    });
};