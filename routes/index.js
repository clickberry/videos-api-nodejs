var express = require('express');

var Bus = require('../lib/bus-service');
var bus = new Bus({});

var router = express.Router();

module.exports = function (passport) {
    router.get('/heartbeat', function (req, res) {
        res.send();
    });

    return router;
};
