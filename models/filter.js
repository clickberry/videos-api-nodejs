var mongoose = require('mongoose');

var filterSchema = mongoose.Schema({
    userId: String,
    videoId: String
});

filterSchema.statics.isPrivate = function (videoId, callback) {
    this.findOne({videoId: videoId}, function (err, filter) {
        if (err) {
            return callback(err);
        }

        if (filter) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    });
};

filterSchema.statics.private = function (videoId, userId, callback) {
    var Comment = this;

    var comment = new Comment({
        videoId: videoId,
        userId: userId
    });
    comment.save(function (err) {
        if (err) {
            return callback(err);
        }

        callback(null);
    });
};

filterSchema.statics.public = function (videoId, userId, callback) {
    var Comment = this;

    Comment.remove({userId: userId, videoId: videoId}, function (err) {
        if (err) {
            return callback(err);
        }

        callback(null);
    });
};

filterSchema.statics.get = function (relationId, callback) {
    this.findOne({relationId: relationId}, function (err, filter) {
        if (err) {
            return callback(err);
        }

        callback(null, !!filter);
    });
};

module.exports = mongoose.model('Filter', filterSchema);
