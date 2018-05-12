// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
 
var express = require("express");
var request = require("request");
var bodyParser = require("body-parser");
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
const mongoose  = require('mongoose');


var app = express();
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(bodyParser.json());

app.listen(process.env.PORT || 3000, function() {
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

app.get("/", function(req, res) {
    res.send("Deployed!");
});

mongoose.Promise = global.Promise;

const JokeSchema = mongoose.Schema({
    "text" : String
  , "categories" : [] }
  , { collection : 'jokes'});

var Jokes = mongoose.model('jokes', JokeSchema);

mongoose.connect('mongodb://nafhta:redneural0336@ds131329.mlab.com:31329/aircache').then(() => 
{
    console.log("Successfully connected to the database");   
}).catch(err => 
{
    console.log(err);
    console.log('Could not connect to the database. Exiting now...');
    process.exit();
});

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements


app.post('/webhook', function(request, response) 
{
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
    }
    
    function tellmeajoke(agent)
    {
        console.log("cantidad " + Jokes.count());
        Jokes.count().exec(function (err, count) 
        {
          var random = Math.floor(Math.random() * count)
          console.log("random " + random);
          Jokes.findOne().skip(random).exec(
            function (err, result) 
            {
              console.log(result);
              agent.add(result.text);
            })
        })
    }

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('tellmeajoke', tellmeajoke);
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  
  agent.handleRequest(intentMap);
});
