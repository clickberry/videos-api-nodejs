var mongoose = require('mongoose');
var moment = require('moment');
var error = require('clickberry-http-errors');

var Schema = mongoose.Schema;

var videoSchema = new Schema({
    userId: String,
    uri: String,
    size: Number,
    name: String,
    created: Date,
    videos: [new Schema({
        contentType: String,
        uri: String,
        width: Number,
        height: Number
    }, {_id: false})],
    screenshots: [new Schema({
        contentType: String,
        uri: String
    }, {_id: false})]
});

videoSchema.statics.getVideo = function (userId, videoId, callback) {
    this.findById(videoId, function (err, video) {
        if (err) {
            return callback(err);
        }

        if (!video) {
            return callback(new error.NotFound());
        }

        if (userId != video.userId) {
            return callback(new error.Forbidden());
        }

        callback(null, video);
    });
};

videoSchema.statics.create = function (userId, size, name, encodedVideo, callback) {
    var Video = this;
    var video = new Video();
    video.userId = userId;
    video.size = size;
    video.name = name;
    video.uri = encodedVideo.uri;
    video.screenshots = encodedVideo.screenshots;
    video.videos = encodedVideo.videos;
    video.created = moment.utc();

    video.save(function (err) {
        if (err) {
            return callback(err);
        }

        callback(null, video);
    });
};

module.exports = mongoose.model('Video', videoSchema);
