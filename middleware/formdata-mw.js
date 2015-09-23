var Busboy = require('busboy');
var Q = require('q');

module.exports = function () {
    return function (req, res, next) {
        var busboy = new Busboy({
            headers: req.headers,
            limits: {
                files: 1
            }
        });

        var isExistFile = false;
        var fields = {};

        var fieldsDeferred = Q.defer();
        req.formData = {};
        req.formData.fieldsPromise = fieldsDeferred.promise;

        busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
            isExistFile = true;

            req.formData.fileStream = file;
            req.formData.fileName = filename;
            next();
        });

        busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated) {
            fields[fieldname] = val;
        });

        busboy.on('finish', function () {
            if (!isExistFile) {
                next(new Error('Bad request. File is absent.'));
            } else {
                fieldsDeferred.resolve(fields);
            }
        });

        req.pipe(busboy);
    };
};
