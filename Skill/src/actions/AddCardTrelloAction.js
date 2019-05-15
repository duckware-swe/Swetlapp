const { Action } = require('./Action.js');
const {phraseGenerator} = require("../utils/PhraseGenerator");
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
     * Funzione per ottenere il JSON della bacheca voluta dall'utente
     * IL JSON della bacheca in questione viene salvato in objBoard
     *
     */
    getBoardWrapper(memberId){
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
     *  It's not using parameters info from DynamoDb yet ..
     *
     * @returns {Promise<string>} Returns an output containing the result of the insert of new card in a list in Trello
     */
    async run() {
    	let check = {
        		output: '',
        		slotReq: 'DEFAULT'
        };
        //let body = this.params[0];
        
        let tempBool; //variabile temporanea
        let indexParams= 0; //indice per ricavare i vari parametri
        let strSiNo;//usata per controllare che l'utente abbia detto si/no

        
        try{
            //ottengo il memberId
            memberId = await httpGetMemberId(nomeUtente);
            console.log('memberId: ', memberId);
        
            console.log("this.params: ", this.params);
            if(memberId !== ''){
                //Prova con Dialog
                if(this.params.length < 2){//ho solo il token
                    //Chiedo all'utente da che bacheca vuole leggere
                    console.log("AddCardTrello params < 2");
                    check.output = "Dimmi il nome della bacheca di Trello dove vuoi aggiungere la scheda";
                    check.slotReq = 'trelloWorkspace';
                }else if(this.params.length ==2) { //ho il nome della bacheca
                    indexParams = this.params.length-1;
                    boardNameSaidByUser = this.params[indexParams];

                    //chiedere all'utente la conferma del nome della bacheca
                    check.output = "Quindi la bacheca scelta si chiama: " + boardNameSaidByUser + " ?";
                    check.slotReq = 'confirmitionSlot';
                    //check.noInput = false;
                    //check.slotReq = 'trelloWorkspace';
                }else if(this.params.length ==3){ //l'utente adesso mi ha detto "si"/"no" per il nome della bacheca
                    indexParams = this.params.length-1;
                    strSiNo = this.params[indexParams];
                    
                    if(strSiNo.toLowerCase() == "si"){
                        if(boardNameSaidByUser == ''){//nome vuoto
                            this.params.splice(indexParams-1,2);//rimuovo l'attuale valore vuoto presente in fondo e ricomincio
                            check.output = "Riprova a dirmi il nome della bacheca di Trello dove vuoi aggiungere la scheda";
                            check.slotReq = 'trelloWorkspace';
                        }else{
                            //si controlla se il nome della bacheca esiste ed è valido per l'utente
                            //quindi ottengo le bacheche dell'utente
                            //si ottiene il JSON della bacheca voluta dall'utente
                            tempBool = await this.getBoardWrapper(memberId);
                            if(tempBool){//bacheca trovata.. OK!
                                check.output = "Ok adesso dimmi il nome della lista dove aggiungere la scheda";
                                check.slotReq = 'trelloList';
                            }else{//Bacheca non trovata .. richiedere all'utente il nome della bacheca
                                check.output = "Riprova a dirmi il nome della bacheca di Trello dove vuoi aggiungere la scheda";
                                check.slotReq = 'trelloWorkspace';
                                this.params.splice(indexParams-1,2);//rimuovo l'attuale valore vuoto presente in fondo e ricomincio perchè è vuoto
                            }
                        }
                    }else{
                        //l'utente ha detto no e quindi vuole ridire il nome della bacheca
                        check.output = "Ok. Riprova a dirmi il nome della bacheca di Trello dove vuoi aggiungere la scheda";
                        check.slotReq = 'trelloWorkspace';
                        this.params.splice(indexParams-1,2);//rimuovo l'attuale valore vuoto presente in fondo e ricomincio perchè è vuoto
                    }

                    check.noInput = false;
                }else if(this.params.length == 4) {//ho il nome della lista
                    indexParams = this.params.length-1;
                    listNameSaidByUser = this.params[indexParams];

                    //chiedere all'utente la conferma del nome della lista
                    check.output = "Quindi la lista scelta si chiama: " + listNameSaidByUser + " ?";
                    check.slotReq= 'confirmitionSlot';
                    //check.slotReq = 'trelloList';
                    //check.noInput = false;
                }else if(this.params.length == 5){ //l'utente ha detto si/no per il nome della lista
                    indexParams = this.params.length-1;
                    strSiNo = this.params[indexParams];

                    if(strSiNo.toLowerCase() == "si") {
                        if (listNameSaidByUser == '') {//nome lista vuoto
                            this.params.splice(indexParams-1, 2);
                            check.output = "Riprova a dirmi il nome della lista dove aggiungere la scheda";
                            check.slotReq = 'trelloList';
                        } else {
                            //si ottiene la lista che l'utente ha voluto
                            tempBool = await getListsFromBoard(trelloBoardId);
                            if (tempBool) {//lista trovata
                                check.output = "Ok adesso dimmi il titolo della scheda da aggiungere";
                                check.slotReq = 'trelloCard';
                            } else { //lista non trovata .. richiederla
                                check.output = "Riprova a dirmi il nome della lista dove aggiungere la scheda";
                                check.slotReq = 'trelloList';
                                this.params.splice(indexParams-1, 2);
                            }
                        }
                    }else{
                        //l'utente ha detto no e quindi vuole ridire il nome della lista
                        check.output = "Ok. Riprova a dirmi il nome della lista";
                        check.slotReq = 'trelloList';
                        this.params.splice(indexParams-1,2);//rimuovo l'attuale valore vuoto presente in fondo e ricomincio perchè è vuoto
                    }
                    //check.noInput = false;
                }else if(this.params.length == 6){//ho il titolo della scheda
                    indexParams = this.params.length-1;
                    titoloSchedaDaAggiungere = this.params[indexParams];

                    check.output = "Quindi il titolo sarà: "+titoloSchedaDaAggiungere+ " ?";
                    check.slotReq = 'confirmitionSlot';
                }else if(this.params.length == 7){ //ho il si/no dell'utente per il titolo della scheda
                    indexParams = this.params.length-1;
                    strSiNo = this.params[indexParams];

                    if(strSiNo.toLowerCase() == "si") {
                        if (titoloSchedaDaAggiungere == '') {//nome lista vuoto
                            this.params.splice(indexParams-1, 2);
                            check.output = "Riprova a dirmi il titolo la scheda";
                            check.slotReq = 'trelloCard';
                        } else {
                            //titolo scheda va bene.. chiedere la descrizione della scheda
                            check.output = "Ok. Dimmi la descrizione della scheda da aggiungere";
                            check.slotReq = 'trelloText';
                        }
                    }else{
                        //l'utente ha detto no e quindi vuole ridire il nome della lista
                        check.output = "Ok. Riprova a dirmi il titolo della scheda";
                        check.slotReq = 'trelloCard';
                        this.params.splice(indexParams-1,2);//rimuovo l'attuale valore vuoto presente in fondo e ricomincio perchè è vuoto
                    }
                }else if(this.params.length == 8){//ho la descrizione della scheda
                    indexParams = this.params.length-1;
                    corpoSchedaDaAggiungere = this.params[indexParams];

                    check.output = "Quindi la descrizione della scheda sarà: "+corpoSchedaDaAggiungere+ " ?";
                    check.slotReq='confirmitionSlot';
                }else if(this.params.length == 9){//ho il si/no dell'utente per la descrizione della scheda
                    indexParams = this.params.length-1;
                    strSiNo = this.params[indexParams];

                    if(strSiNo.toLowerCase() == "si"){
                        if(corpoSchedaDaAggiungere == ''){//ho che la descrizione della scheda è vuota
                            this.params.splice(indexParams-1,2);
                            check.output = "Riprova a dirmi la descrizione della scheda da aggiungere";
                            check.slotReq = 'trelloText';
                        }else{
                            //tutto ok..
                            check.slotReq = 'DEFAULT';
                            tempBool = true;
                        }
                    }

                }

                //qui comincia l'esecuzione se ho tutto le info
                if((boardNameSaidByUser !== '') && (listNameSaidByUser !== '') && (memberId !== '') && (titoloSchedaDaAggiungere != '') && (corpoSchedaDaAggiungere != '') && tempBool){
                    console.log('boardNameSaidByUser: ', boardNameSaidByUser);
                    console.log('listNameByUSer: ', listNameSaidByUser);

                    tempBool = await promiseAddCard(titoloSchedaDaAggiungere,corpoSchedaDaAggiungere,objListOnBoard.id);
                    if(tempBool){//scehda aggiugnta correttamente
                        check.output += "La scheda è stata aggiunta corretamente.";
                    }else{
                        check.output += "Si è verificato un errore.";
                    }
                }    
            }else{
                check.output = "Per usare questo connettore è necessario autenticarsi dall'applicazione.";
            }
        }catch(error){
            check.output = error;
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