"use strict";
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: String,
    userid: String,
    updated_at: { type: Date, default: Date.now },
    username: String,
    password: String,
    email: String,
    firstName: String,
    lastName: String
});

UserSchema.statics.findOrCreate = require("find-or-create");

module.exports = mongoose.model('User', UserSchema);