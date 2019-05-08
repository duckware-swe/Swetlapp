var exports = module.exports = {};

class Action {
    /**
     *
     * @param name {string} name of the action
     * @param params {JSON} parameters of the action
     */
    constructor(name, params) {
        this.name = name;
        this.params = params;
    }

    /**
     *
     */
    async run() {}
}

exports.Action = Action;