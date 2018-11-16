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
  try {
    var urlString = req.body.url;

    Promise.resolve(validateUrlFormat(urlString))
    .then(validateHostname)
    .then(consultWithDatabase)
    .then(function(result) {
      res.json({ original_url: result.original_url,
                 short_url: result.short_url });
    }, function(error) {
      res.json({ error: error });
    });
  } catch(error) { console.log(error) }
});

app.get("/api/shorturl/:id", function (req, res) {
  
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
// checks if host can be reached  
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
//checks if url already exists in database and returns the document - otherwise create new
  return (
    urlPair.findOne({ original_url: validUrl })
    .then(function(foundPair) {
      return foundPair ? foundPair : createAndSavePair(validUrl)
      })
    .catch(function(error) {
      throw error;
    })
  );
}

function createAndSavePair(validUrl) {
  return (
    urlPair.count({})
    .then(function(count) {
      var newPair = new urlPair({ original_url: validUrl, 
                                  short_url: count + 1 });
      newPair.save(newPair)
      .catch(function(error) {
        throw error;
      });
      return newPair;
    })
    .catch(function(error) {
      throw error;
    })
  );
}

app.listen(port, function () {
  console.log('Node.js listening ...');
});
;