var request = require('request');
var config = require('../config');

exports.upload = function (file, filename, quality, contentLength, callback) {
    var formData = {
        method: 'POST',
        preambleCRLF: true,
        postambleCRLF: true,
        uri: config.get('shiva:uri'),
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

    request(formData, function (err, response, body) {
        if (err) {
            return callback(err);
        }

        if (!response || response.statusCode >= 400) {
            return callback(new Error('Encoder error.'));
        }

        callback(err, JSON.parse(body));
    });
};