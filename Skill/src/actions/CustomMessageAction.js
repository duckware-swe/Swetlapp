const { Action } = require('./Action.js');

var exports = module.exports = {};

class CustomMessageAction extends Action {

    /**
     *
     * @returns {Promise<string>} Returns an output based on the messages given as params
     */
    async run() {
        let output = '';
        this.params.forEach(param => {
            //console.log("Parametro: " + param);
            output += param;
        });
        return output;
    }
}

exports.CustomMessageAction = CustomMessageAction;