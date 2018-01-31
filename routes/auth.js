"use strict";
const express = require('express');
const router = express.Router();

const passportFacebook = require('../auth/facebook');
const passportTwitter = require('../auth/twitter');
const passportGoogle = require('../auth/google');
const passportGitHub = require('../auth/github');

/* LOGIN ROUTER */
router.get('/login', function(req, res, next) {
    res.render('login', { title: 'Please Sign In with:' });
});
/* LOGOUT ROUTER */
router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});
/* FACEBOOK ROUTER */
router.get('/facebook',
    passportFacebook.authenticate('facebook'));

router.get('/facebook/callback',
    passportFacebook.authenticate('facebook', { failureRedirect: '/login' }),
    function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
    });

/* TWITTER ROUTER */
router.get('/twitter',
    passportTwitter.authenticate('twitter'));

router.get('/twitter/callback',
    passportTwitter.authenticate('twitter', { failureRedirect: '/login' }),
    function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
    });

/* GOOGLE ROUTER */
router.get('/google',
    passportGoogle.authenticate('google', { scope: 'https://www.google.com/m8/feeds' }));

router.get('/google/callback',
    passportGoogle.authenticate('google', { failureRedirect: '/login' }),
    function(req, res) {
        res.redirect('/');
    });

/* GITHUB ROUTER */
router.get('/github',
    passportGitHub.authenticate('github', { scope: ['user:email'] }));

router.get('/github/callback',
    passportGitHub.authenticate('github', { failureRedirect: '/login' }),
    function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
    });

module.exports = router;