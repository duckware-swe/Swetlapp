const { Action } = require('./Action.js');
const {phraseGenerator} = require("../utils/PhraseGenerator");
const Twitter = require('twitter');

var exports = module.exports = {};

class TwitterWriteAction extends Action {

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
        
        if(this.params.length==1) {
            check.output = phraseGenerator("write_tweet");
            check.slotReq= 'tweetBody';
        } else if(this.params.length==2){
        	check.output = phraseGenerator("confirm_tweet",this.params[1]);
        	check.slotReq= 'confirmitionSlot';
        }else if(this.params.length==3){
        	if(this.params[2]!="si" || this.params[2]!="no"){
        		check.output = phraseGenerator("confirm_tweet",this.params[1]);
            	check.slotReq= 'confirmitionSlot';
        	}else if(this.params[2]=="si"){
        		const twitter = new Twitter({
          		  consumer_key: 'sFOOM7Ln3yEF3pzwibMv16OKs',
          		  consumer_secret: '6SLqOZxNV22gDOmPSSJKQSeWWHfGVKwuk2aTf78HO0qfipwaof',
          		  access_token_key: '1110508480543248384-kkSx42K1rEjMeV4NA6YFVFKvvZGHXm',
          		  access_token_secret: 'Ch95zS5FfL6wiuaFOYl25Z83KcDjIm0VsXq9QpUmBQ4HE'
          		});
        		check.output = phraseGenerator("tweet_success");
        		let body = this.params[1];
        		await twitter.post('statuses/update', {status: body}).then(data => {
        			console.log(data);
        		}, err => {
        			console.log(err);
        		});
        	}else{
        		this.params.length =  1;
        		check.output = phraseGenerator("write_tweet");
        		check.slotReq = 'tweetBody';
        	}        	
        }        
        return check;
    }
}

exports.TwitterWriteAction = TwitterWriteAction;