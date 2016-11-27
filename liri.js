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
        q: 'from%3Abethelmyd', //'from%3Alonesomewonder1',
        count: 20,
        result_type: 'recent'
    };

    t.get('search/tweets', params, displayTweets);

    function displayTweets(err, data, response)
    {
        if(err)
        {
            console.log("Error getting tweets: " + err);
            return;
        }
        console.log(data.statuses);
        var output = "";
        if (data.statuses.length == 0)
        {
            var screen_name = params.q.replace("from%3A", "");
            output = "No tweets from " + screen_name + "\n";
        }
        else{

            output = "Tweets from " +  data.statuses[0].user.name + " - " + data.statuses[0].user.screen_name + ":\n";
            for(var i = 0; i < data.statuses.length; i++)
            {
                output += data.statuses[i].text + "\n";
            }
        }

        output += "***********************************\n";
        console.log(output);
        fs.appendFile(path, output, function(error) {
            if (error) {
                console.error("write error:  " + error.message);
            } else {
                console.log("Successful Write to " + path);
            }
        });

    }
}

function getSongInfo(song){

    
    spotify.search({ type: 'track', query: "track:"+song, limit: 10 }, function(err, data) {
        if ( err ) {
            console.log('Error occurred: ' + err);
            return;
        }
    
        // Do something with 'data'
        var result = "Searching for song: " + song + "\n";
        for(var i = 0; i < data.tracks.items.length; i++)
        {
            var songData = data.tracks.items[i];
            result += "Result [" + (i+1) + "]\n";
            result += "Artist: " + songData.artists[0].name + "\n";
            result += "Song: " + songData.name + "\n";
            result += "Album: " + songData.album.name + "\n";
            result += "Preview URL: " + songData.preview_url + "\n";
            result += "****************************************\n";
        }

        console.log(result);
        fs.appendFile(path, result, function(error) {
            if (error) {
                console.error("Write error:  " + error.message);
            } else {
                console.log("Successful Write to " + path);
            }
        });
    });
}

function getMovieInfo(movieName)
{
    function omdbResponse(err, resp, body){
        if(!err && resp.statusCode === 200)
        {
		    var body = JSON.parse(body);
            var output = "Searching for Movie:\n"
            output += "Title: " + body.Title + "\n";
            output += "Year: " + body.Year + "\n";
            output += "Rating: " + body.Rated + "\n";
            output += "Country: " + body.Country + "\n";
            output += "Language: " + body.Language + "\n";
            output += "Plot: " + body.Plot + "\n";
            output += "Actors: " + body.Actors + "\n";
            output += "Rotten Tomatoes Rating: " + body.tomatoRating + "\n";
            output += "Rotten Tomatoes URL: " + body.tomatoURL + "\n";
            output += "*****************************************\n";
            console.log(output);
            fs.appendFile(path, output, function(error) {
                if (error) {
                    console.error("Write error:  " + error.message);
                } else {
                    console.log("Successful Write to " + path);
                }
            });
        }
        else{
            console.log(err);
        }
    }
    var queryUrl = 'http://www.omdbapi.com/?t=' + movieName +'&tomatoes=true&y=&plot=short&r=json';

    // This line is just to help us debug against the actual URL.  
    console.log(queryUrl);
    request(queryUrl, omdbResponse);
}


function processInput(){
    var args = process.argv;
    if(args.length === 2)
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

    args = args.slice(2);  //get rid of "node liri.js"
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
        default: console.log("Invalid option!");
    }
}

function handleSongs(args){
    var songName = "";
    if(args.length == 1)
    {
        songName = '"The Sign"';
    }
    else{
        args = args.slice(1);
        var songName = '"' + args.join(" ") + '"';
    }

    getSongInfo(songName);
}

function handleMovies(args){
    var movieName = "";
    if(args.length == 1)
    {
        movieName = '"Mr. Nobody"';
    }
    else{
        args = args.slice(1);
        var movieName = '"' + args.join("+") + '"';
    }

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