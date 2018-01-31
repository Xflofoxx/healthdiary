"use strict";
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
        clientID: "932852786804-uos1g83k7rpjofvqm5o5m16u1dav79tt.apps.googleusercontent.com",
        clientSecret: "bMRj4l19AIosrD9SHuGBeUEM",
        callbackURL: "http://127.0.0.1:3000/auth/google/callback"
    },
    function(accessToken, refreshToken, profile, done) {
        User.findOrCreate({ userid: profile.id }, { name: profile.displayName, userid: profile.id }, function(err, user) {
            return done(err, user);
        });
    }
));

module.exports = passport;