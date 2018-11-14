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
  const urlError = validateUrl(urlString)
    
  
  res.json({original_url: result});
});


function async validateURL(urlString) {
  const reURL = /https?:\/\/www.[0-9a-z$–_+!*‘(),]*.[0-9a-z$–_+!*‘(),]*((\/[0-9a-z$–_+!*‘(),]{1,})+)?/i;
  let errorMsg = "";
  if (reURL.test(urlString)) {
    const host = url.parse(urlString).hostname;
    const result = await dns.lookup(host, function (err, address) {
      if (err) {
        errorMsg = "invalid hostname"; 
      }
    });
  } else {
    errorMsg = 'invalid url';
  }
  return errorMsg
}

app.listen(port, function () {
  console.log('Node.js listening ...');
});
