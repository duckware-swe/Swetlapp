const { Action } = require('./Action.js');
const {phraseGenerator} = require("../utils/PhraseGenerator");
const Twitter = require('twitter');

var exports = module.exports = {};

class TwitterHomeAction extends Action {

    constructor(name, params) {
        super(name, params);
    }

    /**
     *
     * @returns {Promise<string>} Returns an output containing the top twitter of a specified account
     */
    async run() {
    	let check = {
        		output: '',
        		slotReq: 'DEFAULT'
        };
    	const twitter = new Twitter({
			  consumer_key: 'sFOOM7Ln3yEF3pzwibMv16OKs',
			  consumer_secret: '6SLqOZxNV22gDOmPSSJKQSeWWHfGVKwuk2aTf78HO0qfipwaof',
    		  access_token_key: this.params[0],
    		  access_token_secret: this.params[1]
			});
    	await twitter.get('statuses/home_timeline', {count: 3, exclude_replies: true}).then(data => {
            check.output+=phraseGenerato("home_tweet",data[0].user.name);
            for(let i =0; i< data.length; i++){
              check.output+= data[i].text+". <break time=\"0.8s\"/> ";
            }
          }, err => {
            check.output+= "Scusa non riesco a leggere dalla tua <lang xml:lang=\"en-US\">Home</lang>";
          });
          return check;
    }
}

exports.TwitterHomeAction = TwitterHomeAction;