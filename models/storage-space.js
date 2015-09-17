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
            console.log(storageSpace);
            callback(err, storageSpace);
        });
};

storageSpaceSchema.statics.checkSpace = function (userId, size, used, callback) {
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
            console.log(storageSpace);
            callback(err, !!storageSpace);
        });
};

module.exports = mongoose.model('StorageSpace', storageSpaceSchema);