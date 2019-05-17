const {phraseGenerator} = require("./src/utils/PhraseGenerator");
const { Action } = require('./Action.js');

var exports = module.exports = {};

class ErrorAction extends Action {
    /**
     *
     * @returns {Promise<string>} Returns an error: the action is not available
     */
    async run() {
        return {
        		output: 'Azione non riconosciuta.',
        		slotReq: 'DEFAULT'
        	   };
    }
}

exports.ErrorAction = ErrorAction;