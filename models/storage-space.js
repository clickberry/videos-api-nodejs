var mongoose = require('mongoose');

var storageSpaceSchema = mongoose.Schema({
    userId: String,
    available: Number,
    used: Number
});

storageSpaceSchema.statics.createIfNotExist = function (userId, available, callback) {
    this.findOneAndUpdate({
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
};

storageSpaceSchema.statics.reserveSpace = function (userId, size, used, callback) {
    this.findOneAndUpdate(
        {
            userId: userId,
            available: {$gte: used + size}
        }, {
            $inc: {used: size}
        },
        {
            new: true
        }, function (err, storageSpace) {
            callback(err, !!storageSpace);
        });
};

storageSpaceSchema.statics.releaseSpace = function (userId, size, callback) {
    this.findOneAndUpdate(
        {
            userId: userId,
            available: {$gte: size}
        },
        {
            $inc: {used: -1 * size}
        },
        {
            new: true
        }, function (err, storageSpace) {
            callback(err, !!storageSpace);
        });
};

module.exports = mongoose.model('StorageSpace', storageSpaceSchema);