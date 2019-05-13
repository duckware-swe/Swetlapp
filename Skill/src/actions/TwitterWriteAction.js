const { Action } = require('./Action.js');
const Twitter = require('twitter');
const twitter = new Twitter({
  consumer_key: 'sFOOM7Ln3yEF3pzwibMv16OKs',
  consumer_secret: '6SLqOZxNV22gDOmPSSJKQSeWWHfGVKwuk2aTf78HO0qfipwaof',
  access_token_key: '1110508480543248384-kkSx42K1rEjMeV4NA6YFVFKvvZGHXm',
  access_token_secret: 'Ch95zS5FfL6wiuaFOYl25Z83KcDjIm0VsXq9QpUmBQ4HE'
});

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
        		noInput: true
        };
        let output = ' Inviato il Tweet';
        /*let body = this.params[0];
        await twitter.post('statuses/update', {status: body}).then(data => {
          console.log(data);
        }, err => {
          console.log(err);
        });
        console.log("un sacco");*/
        
        if(this.params.length<2) {
            console.log("Twitter params <2");
            check.output = "Per pubblicare un tweet, dimmi <emphasis level=\"moderate\">invia</emphasis> seguito dal corpo del messaggio";
            check.noInput= false;
        } else {
            console.log("Twitter ha params input");
            check.output = 'Tweet inviato con successo';
            let body = this.params[1];
            await twitter.post('statuses/update', {status: body}).then(data => {
                console.log(data);
            }, err => {
                console.log(err);
            });
        }
        
        return check;
    }
}

exports.TwitterWriteAction = TwitterWriteAction;