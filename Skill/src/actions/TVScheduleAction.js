const { Action } = require('./Action.js');

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
    }
}

exports.TVScheduleAction = TVScheduleAction;