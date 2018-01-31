"use strict";
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');

passport.use(new FacebookStrategy({
        clientID: "185171248905531",
        clientSecret: "1b23599dc68ac606faafe0f05e1c0e51",
        callbackURL: "http://127.0.0.1:3000/auth/facebook/callback"
    },
    function(accessToken, refreshToken, profile, done) {
        User.findOrCreate({ name: profile.displayName }, { name: profile.displayName, userid: profile.id }, function(err, user) {
            if (err) { return done(err); }
            done(null, user);
        });
    }
));

module.exports = passport;