"use strict";
var Twit = require('twitter');

var twitKeys = require ('./keys.js');

console.log(twitKeys.twitterKeys.consumer_key);

var t = new Twit(twitKeys.twitterKeys);

var params = {
    q: 'banana since:2011-11-11',
    count: 10
};

t.get('search/tweets', params, gotData);

function gotData(err, data, response)
{
    for(var i = 0; i < data.statuses.length; i++)
        console.log(data.statuses[i].text);
}





// var spotify = require('spotify');
 
// spotify.search({ type: 'track', query: 'dancing in the moonlight' }, function(err, data) {
//     if ( err ) {
//         console.log('Error occurred: ' + err);
//         return;
//     }
 
//     // Do something with 'data'
//     console.log(data);
// });

