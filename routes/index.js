var express = require('express');

var videoMw = require('../middleware/video-mw');
var parser = require('../middleware/parser-mw');
var formdata = require('../middleware/formdata-mw');
var permission = require('../middleware/permission-mw')('payload');

var encoder = require('../lib/encoder-service');
var blob=require('../lib/blob-service');

var Video = require('../models/video');
var Filter = require('../models/filter');
var StorageSpace=require('../models/storage-space');

//var Bus = require('../lib/bus-service');
//var bus = new Bus({});

var router = express.Router();

module.exports = function (passport) {
    router.get('/heartbeat', function (req, res) {
        res.send();
    });

    router.post('/upload',
        passport.authenticate('access-token', {session: false, assignProperty: 'payload'}),
        parser.contentLength('contentLength'),
        parser.quality('quality'),
        videoMw.reserveSpace('payload', 'contentLength'),
        formdata(encoder.upload, 'quality', 'contentLength'),
        videoMw.update('payload', 'contentLength'),
        function (req, res, next) {
            var videoDto = videoMapper(req.video);

            res.status(201);
            res.send(videoDto);
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
        permission.checkOwner,
        function (req, res, next) {
            var videoDto = videoMapper(req.video);

            res.send(videoDto);
        });

    router.delete('/:videoId',
        passport.authenticate('access-token', {session: false, assignProperty: 'payload'}),
        permission.checkOwner,
        function (req, res, next) {
            var userId = req.payload.userId;
            var video = req.video;

            blob.delete(video, function(err){
                if (err) {
                    return next(err);
                }

                video.remove(function (err) {
                    if (err) {
                        return next(err);
                    }

                    StorageSpace.releaseSpace(userId, video.size, function (err, result) {
                        if (err) {
                            return next(err);
                        }

                        res.sendStatus(200);
                    });
                });
            });
        });

    return router;
};

function videoMapper(video) {
    return {
        id: video._id,
        userId: video.userId,
        created: video.created,
        videos: video.videos,
        screenshots: video.screenshots
    };
}
