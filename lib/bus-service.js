var util = require('util');
var Publisher = require('clickberry-nsq-publisher');

function Bus(options) {
    Publisher.call(this, options);
}

util.inherits(Bus, Publisher);

Bus.prototype.publishVideoUpload = function (message, callback) {
    if (!callback) {
        callback = function () {}
    }

    this.publish('video-creates', message, function (err) {
        if (err) return callback(err);
        callback();
    });
};

Bus.prototype.publishVideoRemove = function (message, callback) {
    if (!callback) {
        callback = function () {}
    }

    this.publish('video-deletes', message, function (err) {
        if (err) return callback(err);
        callback();
    });
};

module.exports = Bus;