var mongoose = require('mongoose');
var error = require('clickberry-http-errors');
var config = require('clickberry-config');

var storageSpaceSchema = mongoose.Schema({
    userId: String,
    available: Number,
    used: Number
});

storageSpaceSchema.statics.reserveSpace = function (userId, size, callback) {
    createIfNotExist(userId, config.get('storageSize'), function (err, storageSpace) {
        if (err) {
            return callback(err);
        }

        reserveSpace(userId, size, storageSpace.used, function (err, result) {
            if (err) {
                return callback(err);
            }

            if (!result) {
                callback(new error.BadRequest())
            } else {
                callback(null, result);
            }
        })
    });
};

storageSpaceSchema.statics.releaseSpace = function (userId, size, callback) {
    StorageSpace.findOneAndUpdate(
        {
            userId: userId
        },
        {
            $inc: {used: -1 * size}
        },
        {
            new: true
        }, function (err, storageSpace) {
            callback(err, storageSpace);
        });
};

var StorageSpace = module.exports = mongoose.model('StorageSpace', storageSpaceSchema);

function createIfNotExist(userId, available, callback) {
    StorageSpace.findOneAndUpdate(
        {
            userId: userId
        },
        {
            $setOnInsert: {
                userId: userId,
                used: 0,
                available: available
            }
        },
        {
            upsert: true,
            new: true
        },
        function (err, storageSpace) {
            callback(err, storageSpace);
        });
}

function reserveSpace(userId, size, used, callback) {
    StorageSpace.findOneAndUpdate(
        {
            userId: userId,
            available: {$gte: used + size}
        },
        {
            $inc: {used: size}
        },
        {
            new: true
        }, function (err, storageSpace) {
            callback(err, storageSpace);
        });
}