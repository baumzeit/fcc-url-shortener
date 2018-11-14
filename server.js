'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var url = require('url');
var dns = require('dns');

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);

app.use(cors());

/** this project needs to parse POST bodies **/
app.use(bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.post("/api/shorturl/new", function (req, res) {
  const urlString = req.body.url;
   
  Promise.resolve(validateUrlFormat(urlString))
    .then(validateHostname)
    .then(getShortenedUrlFromDatabase(validUrl))
    .then(function(shortUrl) {
      res.json({original_url: urlString});
    }, function(error) {
      res.json({original_url: error});
    });
});

function validateUrlFormat (testString) {
// checks if the input string follows this format: http(s)://www.example.com(/more/routes)
  return new Promise(function(resolve, reject) {
    const reURL = /https?:\/\/www\.[0-9a-z$–_+!*‘(),]*\.[0-9a-z$–_+!*‘(),]*((\/[0-9a-z$–_+!*‘(),]{1,})+)?/i;
    if (reURL.test(testString)) {
      resolve(testString);
    } else {
      reject("Invalid URL: " + testString)
    }
  });
}                    

function validateHostname (urlString) {
// checks if the host can be reached
  return new Promise(function(resolve, reject) {
    const hostname = url.parse(urlString).hostname;
    dns.lookup(hostname, function (err, address) {
      if (err) {
        reject("Invalid hostname: " + hostname); 
      } else {
        resolve(urlString);
      }
    });
  });
}

app.listen(port, function () {
  console.log('Node.js listening ...');
});
