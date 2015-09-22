var Busboy = require('busboy');

module.exports = function (fileCallback, qualityParamName, lengthParamName) {
    return function (req, res, next) {
        var busboy = new Busboy({
            headers: req.headers,
            limits: {
                files: 1
            }
        });

        var isExistFile = false;
        req.formData = {};
        req.formData.fields = {};
        req.formData.files = {};
        res.locals.files = {};

        busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
            isExistFile = true;
            var contentLength = req[lengthParamName];
            var quality = req[qualityParamName];

            fileCallback(file, filename, quality, contentLength, function (err, result) {
                if (err) {
                    return next(err);
                }

                res.locals.files[fieldname] = result;
                next();
            });
        });

        busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated) {
            req.formData.fields[fieldname] = val;
        });

        busboy.on('finish', function () {
            if (!isExistFile) {
                next(new Error('Bad request. File is absent.'));
            }
        });

        busboy.on('error', function (err) {
            next(err);
        });

        req.pipe(busboy);
    };
};

function field(fieldname, val, req) {
    req.formData.fields[fieldname] = val;
}

function file(fieldname, file, res) {
    res.locals.files[fieldname] = data;
}