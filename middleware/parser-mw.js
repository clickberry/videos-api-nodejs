exports.contentLength = function (paramName) {
    paramName = paramName || 'contentLength';
    return function (req, res, next) {
        req[paramName] = parseInt(req.headers['content-length']);
        next();
    };
};

exports.quality = function (paramName) {
    paramName = paramName || 'quality';
    return function (req, res, next) {
        var quality = req.query.quality && req.query.quality.split(",");
        quality = quality || ['S1080', 'S720', 'S480', 'S360'];
        console.log(quality);
        req[paramName] = quality;
        next();
    };
};