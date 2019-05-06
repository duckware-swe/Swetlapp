const { Action } = require('./Action.js');
const Trello = require("trello");

var apiKey = '77b62a6bf6bde24b95bd2f7d28d7b226';
var token = 'a1a5b837de41f33a97f27b8afc716f0dbd0a8db35d51c77cafe95a1db9fdd333';


/**
 * Riferimenti alla pagina: https://www.npmjs.com/package/trello
 * @type {{}}
 */

var exports = module.exports = {};

class AddCardTrelloAction extends Action {

    constructor(params) {
        super(params);
    }

    /**
     *  It's not using parameters info from DynamoDb yet ..
     *
     * @returns {Promise<string>} Returns an output containing the result of the insert of new card in a list in Trello
     */
    async run() {
        let output = '';
        //let body = this.params[0];
        let trello = new Trello(apiKey, token);
        let myListId = '5ca6817e91267628b5af5922'; //Id of the list where to add the card

        let promiseAddCard = () => {
            return new Promise(function (resolve, reject) {
                trello.addCard('Clean car', 'Wax on, wax off', myListId,
                function (error, trelloCard) {
                    if (error) {
                        console.log('errore: ',error);
                        reject('Impossibile aggiungere la scheda richiesta');
                    }
                    else {
                        console.log('scheda aggiunta:', trelloCard);
                        resolve('scheda aggiunta');
                    }
                });
            });
        };
        
        //it is possible to use await
        try{
            output = await promiseAddCard();
        }catch (error) {
            output = error;
        }

        return output;

    }
}

exports.AddCardTrelloAction = AddCardTrelloAction;