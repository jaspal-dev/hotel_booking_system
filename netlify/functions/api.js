const express = require("express");
const { Router } = require("express");
const serverless = require("serverless-http");

const app = express();

module.exports.handler = serverless(app);
