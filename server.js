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
    .then(validateHost)
    .then(function(validUrl) {
      res.json({original_url: validUrl});
    }, function(error) {
      res.json({original_url: 'Error: ' + error});
    });
});



function validateUrlFormat (testString) {
  return new Promise(function(resolve, reject) {
    const reURL = /https?:\/\/www.[0-9a-z$–_+!*‘(),]*.[0-9a-z$–_+!*‘(),]*((\/[0-9a-z$–_+!*‘(),]{1,})+)?/i;
    if (reURL.test(testString)) {
      console.log("valid url")
      resolve(testString);
    }
  reject("invalid url")
  });
}                    

function validateHost (urlString) {
  return new Promise(function(resolve, reject) {
    const urlString = req.body.url;
    dns.lookup(hostname, function (err, address) {
    if (err) {
      reject("invalid hostname"); 
    }
    console.log("valid host")
    resolve(urlString);
  });
});
  }

app.listen(port, function () {
  console.log('Node.js listening ...');
});
