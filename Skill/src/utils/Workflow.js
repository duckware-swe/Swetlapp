import {actionFactory} from "./ActionFactory";

var exports = module.exports = {};

class Workflow {

    /**
     *
     * @param workflowName {string}
     * @param actionList {Array}
     * @param index {int}
     */
    constructor(workflowName, actionList, index) {
        this.workflowName = workflowName;
        this.index = index;
        this.actionList = [];

        actionList.forEach(action => {
            this.actionList.push(actionFactory(action.action, action.params));
        });
    }

    async run() {
        let inputRequired = false;
        let speechText = "";

        for(; this.index<this.actionList.length && !inputRequired; this.index++) {
            let action = this.actionList[this.index];
            //console.log("Esecuzione azione: " + action.action);
            try {
                speechText += await action.run()+". ";

                if(action.inputRequired) {
                    this.index--;
                    inputRequired = true;
                }
            } catch (e) {
                speechText += "Azione non riconosciuta";
            }
        }

        return speechText;
    }

    isInProgress() {
        return this.index < this.actionList.length;
    }

}

exports.Workflow = Workflow;