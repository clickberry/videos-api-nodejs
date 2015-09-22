var Filter = require('../models/filter');
var Video = require('../models/video');

module.exports = function (payloadName) {
    this.checkOwner = function (req, res, next) {
        var userId = req[payloadName].userId;
        var videoId = req.params.videoId;

        Video.findById(videoId, function (err, video) {
            if (err) {
                return next(err);
            }

            if (!video) {
                return next(new Error('Not found video.'));
            }

            if (userId != video.userId) {
                return next(new Error('Forbidden video.'));
            }

            req.video = video;
            next();
        })
    };

    return this;
};
