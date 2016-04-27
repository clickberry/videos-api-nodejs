var express = require('express');
var error = require('clickberry-http-errors');
var config = require('clickberry-config');

var parser = require('../middleware/parser-mw');
var formdata = require('../middleware/formdata-mw');

var videoService = require('../lib/video-service');
var Signature = require('../lib/signature');
var signature = new Signature(config.get('sign:secret'));

var Video = require('../models/video');
var StorageSpace = require('../models/storage-space');

var Bus = require('../lib/bus-service');
var bus = new Bus({
    //mode: config.get('node:env'),
    address: config.get('nsqd:address'),
    port: config.getInt('nsqd:port')
});

bus.on('reconnect_failed', function (err) {
    console.log(err);
    process.exit(1);
});

var router = express.Router();

module.exports = function (passport) {
    router.get('/heartbeat', function (req, res) {
        res.send();
    });

    router.post('/',
        passport.authenticate('access-token', {session: false, assignProperty: 'payload'}),
        parser.contentLength('contentLength'),
        parser.quality('quality'),
        formdata(),
        function (req, res, next) {
            var userId = req.payload.userId;
            var size = req.contentLength;
            var quality = req.quality;
            var formData = req.formData;

            videoService.upload(userId, size, quality, formData, function (err, video, storageSpace) {
                if (err) {
                    formData.fileStream.resume();
                    return next(err);
                }

                var videoDto = videoMapper(video);
                var storageSpaceDto = storageMapper(storageSpace);
                bus.publishVideoUpload(videoDto, storageSpaceDto, function (err) {
                    if (err) {
                        return next(err);
                    }

                    res.status(201);
                    res.send(videoDto);
                });
            });
        });

    router.get('/',
        passport.authenticate('access-token', {session: false, assignProperty: 'payload'}),
        function (req, res, next) {
            var userId = req.payload.userId;

            Video.find({userId: userId}, function (err, videos) {
                if (err) {
                    return next(err);
                }

                var videoDtos = videos.map(videoMapper);
                res.send(videoDtos);
            });
        });

    router.get('/:videoId',
        passport.authenticate('access-token', {session: false, assignProperty: 'payload'}),
        function (req, res, next) {
            var userId = req.payload.userId;
            var videoId = req.params.videoId;

            Video.getVideo(userId, videoId, function (err, video) {
                if (err) {
                    return next(err);
                }

                var videoDto = videoMapper(video);

                res.send(videoDto);
            });
        });

    router.delete('/:videoId',
        passport.authenticate('access-token', {session: false, assignProperty: 'payload'}),
        function (req, res, next) {
            var userId = req.payload.userId;
            var videoId = req.params.videoId;

            videoService.remove(userId, videoId, function (err, video, storageSpace) {
                if (err) {
                    return next(err);
                }

                var storageSpaceDto = storageMapper(storageSpace);
                bus.publishVideoRemove({
                    id: videoId,
                    userId: userId,
                    size: video.size
                }, storageSpaceDto, function (err) {
                    if (err) {
                        return next(err);
                    }

                    res.sendStatus(200);
                });
            });
        });

    router.get('/storage/available',
        passport.authenticate('access-token', {session: false, assignProperty: 'payload'}),
        function (req, res, next) {
            var userId = req.payload.userId;

            StorageSpace.findOne({userId: userId}, function (err, storageSpace) {
                if (err) {
                    return next(err);
                }

                if (!storageSpace) {
                    return next(new error.NotFound());
                }

                var storageDto = storageMapper(storageSpace);
                res.send(storageDto);
            });

        });

    return router;
};

function videoMapper(video) {
    var encodedVideos = video.videos.map(encodedVideoMapper);
    var encodedScreenshots = video.screenshots.map(encodedScreenshotMapper);

    var str = video.videos
        .map(function (video) {
            return video.uri;
        })
        .concat(id)
        .join(",");

    var sign = signature.sign(str);

    var videos = {
        id: video._id,
        encoded: encodedVideos,
        sign: sign
    };

    return {
        id: video._id,
        uri: video.uri,
        userId: video.userId,
        name: video.name,
        size: video.size,
        created: video.created,
        videos: videos,
        screenshots: encodedScreenshots
    };
}

function encodedVideoMapper(encodedVideo) {
    return {
        contentType: encodedVideo.contentType,
        uri: encodedVideo.uri,
        height: encodedVideo.height,
        width: encodedVideo.width
    };
}

function encodedScreenshotMapper(encodedScreenshot) {
    return {
        contentType: encodedScreenshot.contentType,
        uri: encodedScreenshot.uri,
        sign: signature.sign(encodedScreenshot.uri)
    };
}

function storageMapper(storageSpace) {
    return {
        userId: storageSpace.userId,
        available: storageSpace.available,
        used: storageSpace.used
    };
}
