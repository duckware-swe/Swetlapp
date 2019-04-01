const { Action } = require('./Action.js');
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
        let output = ' ';
        let body = this.params[0];
        await twitter.get('statuses/user_timeline', {screen_name: body, count: 3}).then(data => {
          output+= "Ultimi tweet di "+data[0].user.name+": ";
          for(let i =0; i< data.length; i++){
            output+= data[i].text+". <break time=\"0.8s\"/> ";
          }
        }, err => {
          output+= "L'Account "+body+" non esiste";
        });
        /*for(let i=0; i<this.params.length; i++){
            let param = this.params[i];
            //console.log("Parametro: " + param);
            await parser.parseURL(param).then(data => {
                //console.log("Notizie di " + data.title);
                output += 'Queste sono le notizie da: ' + data.title + '. <break time=\"1s\"/> ';

                let i = 0;
                data.items.forEach(item => {
                    if (i < 4) {
                        //console.log('NOTIZIA: ' + item.title);
                        output = output + item.title + '. <break time=\"1.5s\"/> ';
                        i++;
                    }
                });

                output += '. <break time=\"1.5s\"/> ';
            }, () => {
                output += "Non riesco a leggere questo feed.";
            });
        }*/
        return output;
    }
}

exports.TwitterReadAction = TwitterReadAction;