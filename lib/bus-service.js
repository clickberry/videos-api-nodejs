var events = require('events');
var util = require('util');
var nsq = require('nsqjs');
var config = require('../config');

function Bus(options) {
    var bus = this;

    bus._options = options;
    events.EventEmitter.call(this);

    // connect to the Bus
    var busClient = new nsq.Writer(config.get('nsqd:address'), parseInt(config.get('nsqd:port'), 10));
    bus._bus = busClient;
    busClient.connect();
    busClient.on('ready', function () {
        //bus._bus = busClient;
        console.log('ServiceBus is started.');
    });
    busClient.on('error', function (err) {
        console.log(err);
    });
}

util.inherits(Bus, events.EventEmitter);

Bus.prototype.publishSample = function (message, callback) {
    if (!callback) {
        callback = function () {}
    }

    this._bus.publish('topic-name', message, function (err) {
        if (err) return callback(err);
        callback();
    });
};

module.exports = Bus;