const { Action } = require('./Action.js');
/*const weather = require('openweather-apis');
const https = require('https');*/
const request = require('request');
/*weather.setLang('it');
weather.setUnits('metric');
weather.setAPPID('c09e3edbced881809f13e91920dd80ec');*/

var exports = module.exports = {};

function doRequest(url) {
    return new Promise(function (resolve, reject) {
        request(url, function (error, res, body) {
            if (!error && res.statusCode == 200) {
                resolve(body);
            } else {
                reject(error);
            }
        });
    });
}

class WeatherAction extends Action {

    constructor(name, params) {
        super(name, params);
    }



    /**
     *
     * @returns {Promise<string>} Returns an output containing the weather of a specified location
     */
    async run() {
    	let check = {
        		output: 'Le previsioni per ',
        		noInput: true
        };

        let meteo = "https://api.openweathermap.org/data/2.5/weather?lat="+this.params[0]+"&lon="+this.params[1]+"&lang=it&appid=c09e3edbced881809f13e91920dd80ec";

        //Seconda prova con request
        let response = await doRequest(meteo);
        response = JSON.parse(response);
        if(response.name!='')
        	check.output += response.name+" sono: "+response.weather[0].description;
        else
        	check.output += " oggi sono: "+response.weather[0].description;
        return check;
    }


}

exports.WeatherAction = WeatherAction;