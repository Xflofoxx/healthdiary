"use strict";
require('dotenv').config();

const { NODE_ENV } = process.env;

console.log(`Running in '${NODE_ENV}' environment`);