const { Action } = require('./Action.js');
const Trello = require("trello");
const axios = require('axios');

var apiKey = '77b62a6bf6bde24b95bd2f7d28d7b226';
var token = 'a1a5b837de41f33a97f27b8afc716f0dbd0a8db35d51c77cafe95a1db9fdd333';
var trello = new Trello(apiKey, token);

let memberId, boardsIDs=[];

//let trelloBoardId = '5ca6817e46cec324aeed2dc9'; // id della board dove è presente la lista (deve darcelo l'utente?)

let trelloBoardId='';
let objBoard =null; //oggetto che rappresenta tutte le bacheche dell'utente
let objListOnBoard = null;//tutte le liste presenti nella bacheca richiesta dall'utente
let listNameSaidByUser = 'Cose da fare'; //nome lista detta dall'utente
let boardNameSaidByUser = 'Bacheca Prova'; //nome della bacheca pronunciato dall'utente
let titoloSchedaDaAggiungere = '';//titolo della scheda che l'utente vuole aggiungere
let corpoSchedaDaAggiungere = '';//corpo della scheda che l'utente vuole aggiungere
let nomeUtente = 'duckware';

/**
 * Permette di aggiungere una scheda con titolo e corpo
 */
let promiseAddCard = (titoloSchedaDaAggiungere,corpoSchedaDaAggiungere,listID) => {
    return new Promise(function (resolve, reject) {
        trello.addCard(titoloSchedaDaAggiungere, corpoSchedaDaAggiungere, listID, function (error, trelloCard) {
            if (error) {
                console.log('errore addCard: ',error);
                reject(false);
            }
            else {
                console.log('scheda aggiunta: ', trelloCard);
                resolve(JSON.parse(JSON.stringify(trelloCard)));
            }
        });
    });
};

/**
 * Permette di ottenere l'id univoco dell'utente (member ID)
 */
function httpGetMemberId(username) {
    return new Promise((resolve, reject) => {
        axios.get('https://api.trello.com/1/members/'+username)
        .then(response => {
            //console.log(response.data.url);
            //console.log(JSON.parse(JSON.stringify(response.data)));
            memberId = JSON.parse(JSON.stringify(response.data)).id;
            resolve(memberId);
        })
        .catch(error => {
            console.log(error);
            reject(null);
        });
    });
}

/**
 * Funzione per ottenere il JSON della bacheca voluta dall'utente
 * IL JSON della bacheca in questione viene salvato in objBoard
 * 
 */
function getBoardWrapper(memberId){
    //memberId = await httpGetMemberId();
    if(memberId !== null){
        return new Promise(function (resolve, reject) {
            trello.getBoards(memberId,function (error, boards) {
                if (error) {
                    console.log('errore: ',error);
                    reject(false);
                }
                else {
                    //console.log('risposta:', JSON.stringify(boards), '\n');
                    let tempJSON = JSON.parse(JSON.stringify(boards));
                    
                    let actualBoard; //serve per scorrere l'array di oggetti avuto come risposta
                    for(let i=0; i < tempJSON.length;++i){ //ottengo gli id di tutti le bacheche che l'utente possiede
                        actualBoard = tempJSON[i];
                        boardsIDs.push(trelloBoardId);

                        console.log('trello board: ',actualBoard);
                        if((actualBoard.name).toLowerCase() == (boardNameSaidByUser).toLowerCase()){//se il nome  dela bacheca coincide con quello detto dall'utente
                            trelloBoardId = actualBoard.id; //ID della bacheca voluta dall'utente
                            /*if(!(trelloBoardId in objBoard)){//se la proprietà non è già presente
                                objBoard = tempJSON[i];//aggiunge la riga
                            }*/
                            objBoard = tempJSON[i];//JSON della bacheca voluta dall'utente   
                        }
                    }

                    //console.log('board:', JSON.stringify(objBoard), '\n');

                
                    resolve(objBoard !== null);//ritorna true nel caso si trovi la bacheca
                }
            });
        });
    }
    
}

/**
 * ottiene tutte le lista della bacheca specificata
 * 
 * @param {id della bacheca} boardId 
 */
function getListsFromBoard(boardId){
    return new Promise(function (resolve, reject) {
        trello.getListsOnBoard(boardId,function(error,lists){
            if (error) {
                console.log('errore getListsFromBoard: ',error);
                reject(false);
            }
            else {

                //console.log('risposta:', JSON.stringify(lists));
                

                let tempJSON = JSON.parse(JSON.stringify(lists));
                let actualList;
                
                
                for(let i=0; i < tempJSON.length;++i){ //ottengo gli id di tutti le bacheche che l'utente possiede
                    actualList = tempJSON[i];

                    console.log('actual list: ',JSON.stringify(actualList));
                    if((actualList.name).toLowerCase() == (listNameSaidByUser).toLowerCase()){//abbiamo trovato la lista che l'utente cercava
                        objListOnBoard = actualList;
                    }
                }

                console.log('lista trovata:', JSON.stringify(objListOnBoard));

                resolve(objListOnBoard !== null);//successo
            }
        });
    });
}

/**
 * Riferimenti alla pagina: https://www.npmjs.com/package/trello
 * @type {{}}
 */

var exports = module.exports = {};

class AddCardTrelloAction extends Action {

    constructor(name, params) {
        super(name, params);
    }

    /**
     *  It's not using parameters info from DynamoDb yet ..
     *
     * @returns {Promise<string>} Returns an output containing the result of the insert of new card in a list in Trello
     */
    async run() {
    	let check = {
        		output: '',
        		noInput: true
        };
        //let body = this.params[0];
        
        let tempBool; //variabile temporanea
    
        /*
        let myListId = '5ca6817e91267628b5af5922'; //Id of the list where to add the card.. to be pulled from the parameters on Dynamo Db
        let boardId = '5ca6817e46cec324aeed2dc9';
        */

        /*
        try{
            //ottengo il memberId
            memberId = await httpGetMemberId();

            //si ottiene il JSON della bacheca voluta dall'utente
            tempBool = await getBoardWrapper(memberId);
            if(tempBool){//bacheca trovata
                //si ottiene la lista che l'utente ha voluto
                tempBool = await getListsFromBoard(trelloBoardId);
                if(tempBool){//lista trovata
                    console.log('lists: ',objListOnBoard);
                    //aggiungere la scheda con titolo e descrizione
                    tempBool = await promiseAddCard(titoloSchedaDaAggiungere,corpoSchedaDaAggiungere,objListOnBoard.id);
                    if(tempBool){//scehda aggiugnta correttamente
                        check.output += "La scheda è stata aggiunta corretamente";
                    }else{
                        check.output += "Si è verificato un errore";
                    }
                }else{
                    //lista non trovata
                    check.output += "La lista desiderata non è stata trovata";
                }
            }else{
                //Qua dire all'utente che la bacheca scelta non è stata trovata
                check.output += "La bacheca desiderata non è stata trovata";
            }
        }catch(error){
            check.output = error;
        }*/


        console.log("this.params: ", this.params);
        //Prova con Dialog
        if(this.params.length < 2){//ho solo il token
            //Chiedo all'utente da che bacheca vuole leggere
            console.log("AddCardTrello params < 2");
            check.output = "Dimmi il nome della bacheca di Trello dove vuoi aggiungere la scheda";
            check.noInput = false;
        }else if(this.params.length ==2){ //ho il nome della bacheca
            boardNameSaidByUser = this.params[1];
            if(boardNameSaidByUser == ''){//nome vuoto
                this.params.splice(1,1);//rimuovo l'attuale valore vuoto presente in fondo e ricomincio
            }else{
                check.output = "Dimmi il nome della lista dove aggiungere la scheda";
            }
            check.noInput = false;
        }else if(this.params.length == 3){//ho il nome della lista
            listNameSaidByUser = this.params[2];
            if(listNameSaidByUser == ''){//nome lista vuoto
                this.params.splice(2,1);
            }else{
                check.output = "Dimmi il titolo della scheda da aggiungere";
            }
            check.noInput = false;
        }else if(this.params.length == 4){//ho il titolo della scheda
            titoloSchedaDaAggiungere = this.params[3];
            if(titoloSchedaDaAggiungere == ''){//nome lista vuoto
                this.params.splice(3,1);
            }else{
                check.output = "Dimmi la descrizione della scheda da aggiungere";
            }
            check.noInput = false;
        }else if(this.params.length == 5){//ho la descrizione della scheda
            corpoSchedaDaAggiungere = this.params[4];
            if(corpoSchedaDaAggiungere == ''){//nome lista vuoto
                this.params.splice(4,1);
                check.noInput = false;
            }else{ //tutto ok
                check.noInput = true;
                tempBool = true;
            }
        }

        //qui comincia l'esecuzione se ho tutto le info
        if((boardNameSaidByUser !== '') && (listNameSaidByUser !== '') && (memberId !== '') && (titoloSchedaDaAggiungere != '') && (corpoSchedaDaAggiungere != '') && tempBool){
            try{
                console.log('boardNameSaidByUser: ', boardNameSaidByUser);
                console.log('listNameByUSer: ', listNameSaidByUser);
                
                //ottengo il memberId
                memberId = await httpGetMemberId(nomeUtente);
                console.log('memberId: ', memberId);
        

                //si ottiene il JSON della bacheca voluta dall'utente
                tempBool = await getBoardWrapper(memberId);
                if(tempBool){//bacheca trovata
                    //si ottiene la lista che l'utente ha voluto
                    tempBool = await getListsFromBoard(trelloBoardId);
                    if(tempBool){//lista trovata
                        console.log('lists: ',objListOnBoard);
                        //aggiungere la scheda con titolo e descrizione
                        tempBool = await promiseAddCard(titoloSchedaDaAggiungere,corpoSchedaDaAggiungere,objListOnBoard.id);
                        if(tempBool){//scehda aggiugnta correttamente
                            check.output += "La scheda è stata aggiunta corretamente";
                        }else{
                            check.output += "Si è verificato un errore";
                        }
                    }else{
                        //lista non trovata
                        check.output += "La lista desiderata non è stata trovata";
                    }
                }else{
                    //Qua dire all'utente che la bacheca scelta non è stata trovata
                    check.output += "La bacheca desiderata non è stata trovata";
                }

            }catch(error){
                check.output = error;
            }
        }

        console.log('aggiunta scheda: ',check);
        return check;

        /*
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
        	check.output = await promiseAddCard();
        }catch (error) {
        	check.output = error;
        }
        
        return check;
        */
    }
}

exports.AddCardTrelloAction = AddCardTrelloAction;