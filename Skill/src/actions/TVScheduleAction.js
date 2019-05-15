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

        if(!(this.params.length)) {
            check.output = phraseGenerator("tv_ask_channel");
            check.slotReq= 'channelSchedule';
        } else if(this.params.length==1){
            check.output = phraseGenerator("tv_ask_time");
            check.slotReq= 'timeSchedule';
        }else if(this.params.length==2){

            await getTVSchedule(this.params[0].toLowerCase(), fixTime(this.params[1])).then(
                data => {
                    if(!data.length)
                        check.output = phraseGenerator("tv_empty", this.params) + "<break time='300ms'/> ";
                    else{ 
                        check.output = phraseGenerator("tv_completed", this.params) + "<break time='300ms'/> ";
                        data.forEach(item => {
                            let splitTime = item.time.split(":");
                            check.output += "alle " + splitTime[0] + " e " + splitTime[1] + ", " + item.name +". "
                        });
                    }
                },
                //    console.log("data: "+ data);
                    
                error => {
                    console.log("CIE UN ERORE");
                    return error;
                }
            );
        }
        return check;
    }
}

function fixTime(time){
    switch (time) {
        case 'NI':
            return '00:00';
        case 'MO':
            return '06:00';
        case 'AF':
            return '12:00';
        case 'EV':
            return '18:00';
        default :
            return time;
    }
}

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

function getTVSchedule(channel, time) {
    let scheduleList = [];

    let params = buildDatabaseParams(
        "TVChannels",
        "schedule",
        "channel",
        channel
    );

    return getDatabaseInstance().query(params).then(
        data => {
            console.log("data query: " + JSON.stringify(data));
            //if (time === null)
            //    return channelSchedule.set(channel, data.Items);
            //else {
                //let periodSchedule = [];
                data.Items[0].schedule.forEach(item => {
                    console.log(item);
                    if (item.time >= time && item.time < getEndTime(time)) {
                        //periodSchedule.push(item);
                        scheduleList.push(item)
                    }
                });
                //return channelSchedule.set(channel, periodSchedule);
                return scheduleList;
            //}
        },
        err => {
            console.log("query err: " + err);
        }
    );
}

exports.TVScheduleAction = TVScheduleAction;