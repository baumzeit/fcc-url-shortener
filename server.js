'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var bodyParser = require('body-parser');
var url = require('url');
var dns = require('dns');

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;
process.env.MONGOLAB_URI = "mongodb://user:pass-0@ds153093.mlab.com:53093/url-shortener"

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGOLAB_URI, { useNewUrlParser: true, useCreateIndex: true });

var urlPairSchema = new Schema({
  original_url: { type: String, required: true, unique: true, default: "https://www.freecodecamp.com" },
  short_url: { type: Number, required: true, unique: true, default: 0 }
});

var urlPair = mongoose.model('urlPair', urlPairSchema)

app.use(cors());

/** this project needs to parse POST bodies **/
app.use(bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.post("/api/shorturl/new", function (req, res) {
  var urlString = req.body.url;
   
  Promise.resolve(validateUrlFormat(urlString))
    .then(validateHostname)
    .then(consultWithDatabase)
    .then(function(result) {
      res.json(result);
    }, function(error) {
      res.json({ original_url: error });
    });
});

function validateUrlFormat (testString) {
// checks if the input string follows this format: http(s)://www.example(.foobar).com(/more/routes)
  return new Promise(function(resolve, reject) {
    var reURL = /https?:\/\/www(\.[0-9a-z$\-_+!*‘(),]{1,}){2,}((\/[0-9a-z$\–_+!*‘(),]{1,})+)?/i;
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
    var hostname = url.parse(urlString).hostname;
    dns.lookup(hostname, function (err, address) {
      if (err) {
        reject("Invalid hostname: " + hostname); 
      } else {
        resolve(urlString);
      }
    });
  });
}

function consultWithDatabase (validUrl) {
    return new Promise(function(resolve, reject) {
      urlPair.findOne({ original_url: validUrl })
      .then(function(foundPair) {
        if (foundPair) {
          
          console.log("found pair: " + foundPair)
          
          resolve(foundPair)
        } else {
          
          console.log("not found - need to create")
          
          resolve(createAndSavePair(validUrl))
        }
      })
      .catch((error) => {throw error});
    });
}

function createAndSavePair(validUrl) {
  
  return new Promise(function(resolve, reject) {
    urlPair.count({})
    .then(function(count) {
      var newPair = new urlPair({ original_url: validUrl, 
                                  short_url: count + 1 });
      
      console.log("created newPair with id: " + newPair.short_url)
      
      newPair.save(newPair)
      .catch(function(error) {
        reject(error);
      });
      resolve(newPair.select('original_url short_url'))
    })
    .catch(function(error) {
      reject(error);
    });
  });
}

app.listen(port, function () {
  console.log('Node.js listening ...');
});
