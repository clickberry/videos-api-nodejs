var error = require('clickberry-http-errors');
var Video = require('../models/video');
var StorageSpace = require('../models/storage-space');
var encoder = require('./encoder-service');
var blob = require('./blob-service');

exports.upload = function (userId, size, quality, formData, callback) {
    StorageSpace.reserveSpace(userId, size, function (err, storageSpace) {
        if (err) {
            return callback(err);
        }

        encoder.upload(formData.fileStream, formData.fileName, size, quality, function (err, encodedVideo) {
            if (err) {
                return storageRollback(userId, size, function(){
                    callback(err);
                });
            }

            formData.fieldsPromise.then(function (fields) {
                Video.create(userId, size, fields.name, encodedVideo, function (err, video) {
                    if (err) {
                        return rollback(userId, size, encodedVideo, function(){
                            callback(err);
                        });
                    }

                    callback(null, video, storageSpace);
                });
            }).catch(function (err) {
                return rollback(userId, size, encodedVideo, function(){
                    callback(err);
                });
            });
        });
    });
};

exports.remove = function (userId, videoId, callback) {
    Video.getVideo(userId, videoId, function (err, video) {
        if (err) {
            return callback(err);
        }

        Video.findByIdAndRemove(videoId, function (err, doc) {
            if (err) {
                return callback(err);
            }

            if (!doc) {
                return callback(new error.NotFound());
            }

            StorageSpace.releaseSpace(userId, video.size, function (err, storageSpace) {
                if (err) {
                    return callback(err);
                }

                blob.delete(video, function (err) {
                    if (err) {
                        return callback(err);
                    }

                    callback(null, video, storageSpace);
                });
            });
        });
    });
};

function rollback(userId, size, video, callback) {
    return StorageSpace.releaseSpace(userId, size, function () {
        blob.delete(video, function () {
            callback();
        });
    });
}
function storageRollback(userId, size, callback) {
    return StorageSpace.releaseSpace(userId, size, function () {
        callback();
    });
}