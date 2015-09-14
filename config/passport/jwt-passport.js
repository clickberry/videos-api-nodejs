var JwtStrategy = require('passport-jwt').Strategy;

var config = require('../index');

module.exports = function (passport) {
    passport.use('access-token', new JwtStrategy({
        secretOrKey: config.get('token:accessSecret')
    }, function (jwtPayload, done) {
        done(null, jwtPayload);
    }));
};