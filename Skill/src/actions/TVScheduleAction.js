const { Action } = require('./Action.js');
const {phraseGenerator} = require("../utils/PhraseGenerator");
const {getDatabaseInstance, buildDatabaseParams} = require("../DatabaseInteractor");

var exports = module.exports = {};

class TVScheduleAction extends Action {

    constructor(name, params) {
        super(name, params);
    }

    /**
     *
     * @returns {Promise<string>} Returns an output TODO
     */
    async run() {
    	let check = {
        		output: '',
        		slotReq: 'DEFAULT'
        };

        //TODO check se ci sono elementi in params, altrimenti il pop può ritornare un undefined

        //let time = this.params.pop();
        //console.log(this.params);
        //console.log(time);

        if(!(this.params.length)) {
            check.output = phraseGenerator("tv_ask_channel");
            check.slotReq= 'channelSchedule';
        } else if(this.params.length==1){
            check.output = phraseGenerator("tv_ask_time");
            check.slotReq= 'timeSchedule';
        }else if(this.params.length==2){
            
            /*await getTVSchedule(this.params[0], this.params[1]).then(
                data => {
                    check.output = phraseGenerator("tv_completed", this.params);
                    console.log("data: "+ data);
                    
                },
                error => {
                    console.log("CIE UN ERORE");
                    return error;
                }
            );*/
            console.log("sono dentro a paramz==2")
        }
        return check;
    }
}


/*
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
        return check; */
/*
var chlist=["cielo", "spike"];
chlist.forEach(function(channel){
	var programmiDiOggi = promessaRitornata.get(channel);  //promessaRitornata e' il ritorno della query
	console.log(channel + "-->");
	programmiDiOggi.forEach(function(item){
		console.log(item.name + " alle ore " + item.time);
	});
});
 

    }
}
*/

function getEndTime(time) {
    let aux = time.split(":").map(item => parseInt(item) );
    aux[0] += 6;
    if(aux[0]>24)
        aux[0]=24;
    let auxString = aux.map(item => item.toString());

    if(auxString[0]<"10")
        auxString[0]= "0"+auxString[0];

    return auxString[0] + ":" + auxString[1];
}

function getTVSchedule(channelList, time) {
    let channelSchedule = new Map();
    let promiseList = [];

    channelList.forEach(channel => {
        let params = buildDatabaseParams(
            "TVChannels",
            "schedule",
            "channel",
            channel
        );

        promiseList.push(
            getDatabaseInstance().query(params).then(
                data => {
                    if (time === null)
                        channelSchedule.set(channel, data.Items);
                    else {
                        let periodSchedule = [];
                        data.Items[0].schedule.forEach(item => {
                            if (item.time >= time && item.time < getEndTime(time)) {
                                periodSchedule.push(item);
                            }
                        });
                        channelSchedule.set(channel, periodSchedule);
                    }
                }
            )
        );
    });

    return Promise.all(promiseList).then(
        () => channelSchedule
    );
}

exports.TVScheduleAction = TVScheduleAction;