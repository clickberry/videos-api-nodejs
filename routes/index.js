var express = require('express');

var config = require('../config');
var videoMw = require('../middleware/video-mw');
var parser=require('../middleware/parser-mw');
var formdata = require('../middleware/formdata-mw');
var encoder = require('../lib/encoder-service');

//var Bus = require('../lib/bus-service');
//var bus = new Bus({});

var router = express.Router();

module.exports = function (passport) {
    router.get('/heartbeat', function (req, res) {
        res.send();
    });

    router.post('/upload/',
        passport.authenticate('access-token', {session: false, assignProperty: 'payload'}),
        parser.contentLength('contentLength'),
        parser.quality('quality'),
        videoMw.checkSpace('payload', 'contentLength'),
        formdata(encoder.upload, 'quality', 'contentLength'),
        videoMw.update('payload', 'contentLength'),
        function (req, res, next) {
            var tempUri = '';

            res.send(videoMapper(req.video));
        });

    return router;
};

function videoMapper(video) {
    return {
        id: video._id,
        userId: video.userId,
        created: video.created
    };
}
