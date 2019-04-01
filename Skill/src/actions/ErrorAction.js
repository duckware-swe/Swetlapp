const { Action } = require('./Action.js');

var exports = module.exports = {};

class CustomMessageAction extends Action {
    /**
     *
     * @returns {Promise<string>} Returns an error: the action is not available
     */
    async run() {
        return 'Azione non riconosciuta.';
    }
}

exports.CustomMessageAction = CustomMessageAction;