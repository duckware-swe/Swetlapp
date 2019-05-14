const { Action } = require('./Action.js');
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

        let time = this.params.pop();
        console.log(this.params);
        console.log(time);

/*
var chlist=["cielo", "spike"];
chlist.forEach(function(channel){
	var programmiDiOggi = promessaRitornata.get(channel);  //promessaRitornata e' il ritorno della query
	console.log(channel + "-->");
	programmiDiOggi.forEach(function(item){
		console.log(item.name + " alle ore " + item.time);
	});
});
 */

        await getTVSchedule(this.params, time).then(
            data => {
                check.output += "Notizie lette";
            },
            error => {
                console.log("CIE UN ERORE");
                return error;
            }
        );
        return check;
    }
}

function getEndTime(time) {
    let aux = time.split(":").map(item => parseInt(item) );
    aux[0] += 6;
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