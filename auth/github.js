"use strict";
const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;
const User = require('../models/User');

passport.use(new GitHubStrategy({
        clientID: "9c4de0de6679c6f9607a",
        clientSecret: "28f7cd79e2caedadebfdefd3abf62c82c09b8cbd",
        callbackURL: "http://127.0.0.1:3000/auth/github/callback"
    },
    function(accessToken, refreshToken, profile, done) {
        User.findOrCreate({ userid: profile.id }, { name: profile.displayName, userid: profile.id }, function(err, user) {
            return done(err, user);
        });
    }
));

module.exports = passport;