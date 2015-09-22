var moment = require('moment');
var Video = require('../models/video');
var StorageSpace = require('../models/storage-space');
var config = require('../config');

exports.reserveSpace = function (accessPayloadName, lengthParamName) {
    return function (req, res, next) {
        var payload = req[accessPayloadName];
        var contentLength = req[lengthParamName];

        StorageSpace.createIfNotExist(payload.userId, config.get('storageSize'), function (err, storageSpace) {
            if (err) {
                return next(err);
            }

            StorageSpace.reserveSpace(payload.userId, contentLength, storageSpace.used, function (err, result) {
                if (err) {
                    return next(err);
                }

                if (!result) {
                    next(new Error('Bad request. Not enough storage space.'))
                } else {
                    next();
                }
            })
        });
    };
};


exports.update = function (accessPayloadName, lengthParamName) {
    return function (req, res, next) {
        var payload = req[accessPayloadName];
        var contentLength = req[lengthParamName];

        var encoded = res.locals.files.video;
        var fields = req.formData.fields;

        var video = new Video();
        video.userId = payload.userId;
        video.size = contentLength;
        video.uri = encoded.uri;
        video.screenshots = encoded.screenshots;
        video.videos = encoded.videos;
        video.name = fields.name;
        video.created = moment.utc();

        video.save(function (err) {
            if (err) {
                return next(err);
            }

            req.video = video;
            next();
        });
    };
};
