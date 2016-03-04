var util = require('util');
var Publisher = require('clickberry-nsq-publisher');
var Q = require('q');
var publishAsync;

function Bus(options) {
    Publisher.call(this, options);
    publishAsync = Q.nbind(this.publish, this);
}

util.inherits(Bus, Publisher);

Bus.prototype.publishVideoUpload = function (video, storageSpace, callback) {
    Q.all([
        publishAsync('video-creates', video),
        publishAsync('video-storage-updates', storageSpace)
    ]).then(function () {
        callback();
    }).catch(function (err) {
        callback(err);
    });
};

Bus.prototype.publishVideoRemove = function (video, storageSpace, callback) {
    Q.all([
        publishAsync('video-deletes', video),
        publishAsync('video-storage-updates', storageSpace)
    ]).then(function(){
        callback();
    }).catch(function(err){
        callback(err);
    });
};

module.exports = Bus;