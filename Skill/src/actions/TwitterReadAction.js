const { Action } = require('./Action.js');
const {phraseGenerator} = require("../utils/PhraseGenerator");
const Twitter = require('twitter');
const twitter = new Twitter({
  consumer_key: 'sFOOM7Ln3yEF3pzwibMv16OKs',
  consumer_secret: '6SLqOZxNV22gDOmPSSJKQSeWWHfGVKwuk2aTf78HO0qfipwaof',
  access_token_key: '1110508480543248384-kkSx42K1rEjMeV4NA6YFVFKvvZGHXm',
  access_token_secret: 'Ch95zS5FfL6wiuaFOYl25Z83KcDjIm0VsXq9QpUmBQ4HE'
});

var exports = module.exports = {};

class TwitterReadAction extends Action {

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
        let body = this.params[0];
        await twitter.get('statuses/user_timeline', {screen_name: body, count: 3, exclude_replies: true}).then(data => {
          check.output+=phraseGenerato("read_tweet",data[0].user.name);
          for(let i =0; i< data.length; i++){
            check.output+= data[i].text+". <break time=\"0.8s\"/> ";
          }
        }, err => {
          check.output+= "L'Account "+body+" non esiste";
        });
        return check;
    }
}

exports.TwitterReadAction = TwitterReadAction;