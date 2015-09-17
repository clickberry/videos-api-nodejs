var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var videoSchema = new Schema({
    userId: String,
    uri: String,
    size: Number,
    name: String,
    created: Date,
    videos: [new Schema({
        contentType: String,
        uri: String,
        width: Number,
        height: Number
    }, {_id: false})],
    screenshots: [new Schema({
        contentType: String,
        uri: String
    }, {_id: false})]
});

module.exports = mongoose.model('Video', videoSchema);
