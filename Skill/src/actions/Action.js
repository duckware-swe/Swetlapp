var exports = module.exports = {};

class Action {
    /**
     *
     * @param params {JSON} parameters of the action
     */


    constructor(params) {
        this.params = params;
        this.inputRequired = false;
    }

    /**
     *
     */
    async run() {}
}

exports.Action = Action;