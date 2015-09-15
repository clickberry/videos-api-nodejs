var express = require('express');
var request = require('request');
var Busboy = require('busboy');

//var Bus = require('../lib/bus-service');
//var bus = new Bus({});

var router = express.Router();

module.exports = function (passport) {
    router.get('/heartbeat', function (req, res) {
        res.send();
    });

    router.post('/upload', function (req, res, next) {
        var busboy = new Busboy({
            headers: req.headers,
            limits: {
                //fileSize: 1099511627776// 1 TByte,
                //fileSize: 200,
                files: 1
            }
        });
        busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
            var formData = {
                method: 'POST',
                //preambleCRLF: true,
                //postambleCRLF: true,
                uri: 'http://localhost:8081/upload2',
                formData: {
                    myFile: {
                        value: file,
                        options: {
                            filename: 'file_name123.txt',
                            contentType: 'text/plain',
                            knownLength: req.headers['content-length']
                        }
                    }
                }
            };

            request(formData, function (err, response, body) {
                if (err) {
                    return next(err)
                }

                //console.log(response);
                console.log(body);
                console.log('Upload to /upload2 completed!');
                res.sendStatus(200);
            });

        });
        busboy.on('finish', function () {
            console.log('finish upload.')
            //res.send("That's all folks!");
        });

        busboy.on('partsLimit', function (err) {
            console.log('partsLimit');
            //next(err);
        });
        busboy.on('filesLimit', function (err) {
            console.log('filesLimit');
            //next(err);
        });

        busboy.on('error', function (err) {
            next(err);
        });

        req.pipe(busboy);
    });

    return router;
};
