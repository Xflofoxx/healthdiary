"use strict";
const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const User = require('../models/User');

passport.serializeUser(function(user, fn) {
    fn(null, user);
});

passport.deserializeUser(function(id, fn) {
    User.findOne({ _id: id.doc._id }, function(err, user) {
        fn(err, user);
    });
});

passport.use(new TwitterStrategy({
        consumerKey: "GiwdBUccd6cQsQrarB0X0PN7P",
        consumerSecret: "xmltQ4iaXthTYE3ecp5xzE30orrQyQ5cpDcXebUIjHHIAaSbJC",
        callbackURL: "http://127.0.0.1:3000/auth/twitter/callback"
    },
    function(accessToken, refreshToken, profile, done) {
        User.findOrCreate({ name: profile.displayName }, { name: profile.displayName, userid: profile.id }, function(err, user) {
            if (err) {
                console.log(err);
                return done(err);
            }
            done(null, user);
        });
    }
));

module.exports = passport;