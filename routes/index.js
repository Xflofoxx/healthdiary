"use strict";
const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/treatments', function(req, res) {
    res.render('treatments', { title: 'Treatments' });
});

router.get('/illness', function(req, res) {
    res.render('illness', { title: 'Illness' });
});

router.get('/doctors', function(req, res) {
    res.render('doctors', { title: 'Doctors' });
});

router.get('/events', function(req, res) {
    res.render('events', { title: 'Events' });
});

router.get('/', function(req, res) {
    res.render('home', { title: 'Home' });
});
module.exports = router;