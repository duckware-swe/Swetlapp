const { Action } = require('./Action.js');

var exports = module.exports = {};

class CustomMessageAction extends Action {

    /**
     *
     * @returns {Promise<string>} Returns an output based on the messages given as params
     */
    async run() {
    	let check = {
        		output: '',
        		noInput: true
        };
        this.params.forEach(param => {
            //console.log("Parametro: " + param);
        	check.output += param;
        });
        return check;
    }
}

exports.CustomMessageAction = CustomMessageAction;