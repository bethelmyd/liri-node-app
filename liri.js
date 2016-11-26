"use strict";
var request = require("request");
var spotify = require('spotify');
var Twit = require('twitter');
var twitKeys = require ('./keys.js');
var fs = require("fs");
var path = "./log.txt";

function getTweets(){
    var t = new Twit(twitKeys.twitterKeys);

    var params = {
        q: 'computer science since:2011-11-11',
        count: 10
    };

    t.get('search/tweets', params, gotData);

    function gotData(err, data, response)
    {
        for(var i = 0; i < data.statuses.length; i++)
        {
            console.log(data.statuses[i].text);
            fs.appendFile(path, data.statuses[i].text+"\n", function(error) {
                if (error) {
                    console.error("write error:  " + error.message);
                } else {
                    console.log("Successful Write to " + path);
                }
            });
        }
    }
}

function getSongInfo(song){

    
    spotify.search({ type: 'track', query: song }, function(err, data) {
        if ( err ) {
            console.log('Error occurred: ' + err);
            return;
        }
    
        // Do something with 'data'
        console.log(data);
    });
}

function getMovieInfo(movieName)
{
    function omdbResponse(err, resp, body){
        if(!err && resp.statusCode === 200)
        {
		    var body = JSON.parse(body);
            console.log("Title: " + body.Title);
            console.log("Year: " + body.Year);
            console.log("Rating: " + body.Rated);
            console.log("Country: " + body.Country);
            console.log("Language: " + body.Language);
            console.log("Plot: " + body.Plot);
            console.log("Actors: " + body.Actors);
        }
        else{
            console.log(err);
        }
    }
    var queryUrl = 'http://www.omdbapi.com/?t=' + movieName +'&y=&plot=short&r=json';

    // This line is just to help us debug against the actual URL.  
    console.log(queryUrl);
    request(queryUrl, omdbResponse);
}


function processInput(){
    var args = process.argv.slice(2);
    if(args.length === 0)
    {
        console.log("Usage:");
        console.log("node liri.js my-tweets");
        console.log("or");
        console.log("node liri.js spotify-this-song '<song name here>'");
        console.log("or");
        console.log("node liri.js movie-this '<movie name here>'");
        console.log("or");
        console.log("node liri.js do-what-it-says");        
        return;
    }

    processCommands(args);
}

function processCommands(args)
{
    switch(args[0])
    {
        case 'my-tweets': getTweets(); break;
        case 'spotify-this-song': handleSongs(args); break;
        case 'movie-this': handleMovies(args); break;
        case 'do-what-it-says': handleFileRead(); break;
        default: console.log("Invalid options");
    }
}

function handleSongs(args){
    if(args.length == 1)
    {
        console.log("You need to give the name of a song.");
        return;
    }
    args = args.slice(1);
    var songName = args.join("+");

    getSongInfo(songName);
}

function handleMovies(args){
    if(args.length == 1)
    {
        console.log("You need to give the name of a movie.");
        return;
    }
    args = args.slice(1);
    var movieName = args.join("+");

    getMovieInfo(movieName);
}

function handleFileRead(){
    var path = "./log.txt";
    function readFile(err, data)
    {
        if(err)
        {
            console.log("error reading file: " + err);
            return;
        }

        var args = data.split(",");
        if(args[0] !== 'do-what-it-says')
            processCommands(args);
    }

    fs.readFile("random.txt", "utf8", readFile);
}


//start here
processInput();