const { Action } = require('./Action.js');
const {phraseGenerator} = require("../utils/PhraseGenerator");
const Trello = require("trello");
const axios = require('axios');

var apiKey = '77b62a6bf6bde24b95bd2f7d28d7b226';
var token = 'a1a5b837de41f33a97f27b8afc716f0dbd0a8db35d51c77cafe95a1db9fdd333';
var trello = new Trello(apiKey, token);

let memberId=''; //id dell'utente
let boardsIDs=[]; //contiene gli ID tutte le bachece proprie dell'utente (nel caso serva)
let trelloBoardId ='';//id della bacheca che l'utente ha scelto a voce
let objBoard = null; //oggetto JSON contiene tutto sulla bacheca voluta dall'utente
let objListOnBoard = null; //oggetto JSON della lista che l'utente ha scelto
//let listNameSaidByUser = 'In esecuzione';//nome lista detta dall'utente
let listNameSaidByUser = '';//nome lista detta dall'utente
let boardNameSaidByUser = '';//corpo della scheda che l'utente vuole aggiungere
//let listNameSaidByUser = 'In esecuzifsdfsdfone';//nome lista detta dall'utente
//let boardNameSaidByUser = 'Bacheca prova';//corpo della scheda che l'utente vuole aggiungere
//let boardNameSaidByUser = 'Bacheca fdsfsdfsdfsdfprova';//corpo della scheda che l'utente vuole aggiungere
let numberOfCardsToRead = 3; //Le prime 3 schede da leggere
let arrOfObjsSchede={}; //array di oggetti riguardanti le schede
let nomeUtente = 'duckware';

/**
 * See link trello developers: https://developers.trello.com
 * For example we can use the following url: 'https://api.trello.com/1/boards/{boardId}/?cards=all' to get all cards in a board
 *
 * Riferimenti alla pagina: https://www.npmjs.com/package/trello
 *
 * To get Api Key follow: https://trello.com/app-key
 * To get token key just click on the link 'puoi generare un Token manualmente'. It is near the section where there is the Api Key
 *
 * @type {{}}
 */

var exports = module.exports = {};

/**
 * Permette di ottenere l'id univoco dell'utente (member ID)
 */
function httpGetMemberId() {
    return new Promise((resolve, reject) => {
        axios.get('https://api.trello.com/1/members/'+nomeUtente)
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
						console.log('trelloboard sade by user == fdsfsdf', (actualBoard.name).toLowerCase() == (boardNameSaidByUser).toLowerCase());
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
 * Permette di ottenere tutte le schede che sono presenti sulla lista specificata
 */
function getCardsOnList_Wrapper(listId){
    return new Promise(function(resolve,reject){
        trello.getCardsOnList(listId,function(error,cards){
            if (error) {
                console.log('errore - getCardsOnBoard: ',error);
                reject(false);
            }else{
                console.log('\n ho le schede getCardsOnBoard: ', JSON.stringify(cards));

                /**
                 * Qua mi ritorna tutto l'object con tutte le schede della lista:
                 * 
                 * titolo scheda: name
                 * descrizione scheda: desc 
                 * 
                 */

                arrOfObjsSchede = JSON.parse(JSON.stringify(cards));
                resolve(arrOfObjsSchede.length > 0);
            }
        });
    });
}

class GetCardsFromBoardTrelloAction extends Action {

    constructor(name, params) {
        super(name, params);
    }

    /**
     * TODO
     *
     *  TODO
     *
     * @returns {Promise<string>} TODO
     */
    async run() {
        let check = {
            output: '',
            slotReq: 'DEFAULT'
        };
        let tempBool=false; //variabile temporanea
        let tempObj;
        let indexParams= 0; //indice per ricavare i vari parametri

       try{
            //ottengo il memberId
			if(memberId == ''){
				memberId = await httpGetMemberId(nomeUtente);
				console.log('memberId: ', memberId);
			}
        
            console.log("this.params: ", this.params);
            if(memberId !== ''){
                //Prova con Dialog
				indexParams = this.params.length-1;
                if(this.params.length < 2){//ho solo il token
                    //Chiedo all'utente da che bacheca vuole leggere
					console.log("GetCardsTrello params < 2");
					token = this.params[indexParams];
                    check.output = "Dimmi il nome della bacheca di Trello da dove vuoi leggere le tue schede";
                    check.slotReq = 'trelloWorkspace';
                }else if(this.params.length ==2){ //ho il nome della bacheca
                    
                    boardNameSaidByUser = this.params[indexParams];
                    if(boardNameSaidByUser == ''){//nome vuoto
                        this.params.splice(indexParams,1);//rimuovo l'attuale valore vuoto presente in fondo e ricomincio
                        check.output = "Riprova a dirmi il nome della bacheca di Trello da dove vuoi leggere le schede";
                        check.slotReq = 'trelloWorkspace';
                    }else{
                        //si controlla se il nome della bacheca esiste ed è valido per l'utente
                        //quindi ottengo le bacheche dell'utente
                        //si ottiene il JSON della bacheca voluta dall'utente
                        tempBool = await getBoardWrapper(memberId);
                        if(tempBool){//bacheca trovata.. OK!
                            check.output = "Ok adesso dimmi il nome della lista da dove leggere le tue schede";
                            check.slotReq = 'trelloList';
                        }else{//Bacheca non trovata .. richiedere all'utente il nome della bacheca
                            check.output = "Riprova a dirmi il nome della bacheca di Trello da dove leggere le tue schede";
                            this.params.splice(indexParams,1);//rimuovo l'attuale valore vuoto presente in fondo e ricomincio perchè è vuoto
                            check.slotReq = 'trelloWorkspace';
                        }
                    }
                }else if(this.params.length == 3){//ho il nome della lista
                    listNameSaidByUser = this.params[indexParams];
                    if(listNameSaidByUser == ''){//nome lista vuoto
                        this.params.splice(indexParams,1);
                    }else{
                        //si ottiene la lista che l'utente ha voluto
                        tempBool = await getListsFromBoard(trelloBoardId);
                        if(tempBool){//lista trovata
                            check.slotReq = 'DEFAULT'; //tutto ok
                            tempBool = true;
                        }else{ //lista non trovata .. richiederla
                            check.output = "Riprova a dirmi il nome della lista da dove leggere le tue schede";
                            this.params.splice(indexParams,1);
                            check.slotReq = 'trelloList';
                        } 
                    }
                }

                //qui comincia l'esecuzione se ho tutto le info
                if((boardNameSaidByUser !== '') && (listNameSaidByUser !== '') && (memberId !== '') && tempBool){
                    console.log('boardNameSaidByUser: ', boardNameSaidByUser);
                    console.log('listNameByUSer: ', listNameSaidByUser);
                    
                    //ottenere la descrizione delle schede della lista
                    tempBool = await getCardsOnList_Wrapper(objListOnBoard.id);
                    if(tempBool){//schede recuperate
                        for(let i=0; i< arrOfObjsSchede.length;++i){
                            tempObj = arrOfObjsSchede[i];
                            if(tempObj.name != ""){
                                if(tempObj.desc != ""){
                                    check.output += " La scheda "+tempObj.name+" ha come descrizione " +tempObj.desc + " <break time=\"0.8s\"/> .";
                                }else{//descrizione della scheda vuota
                                    check.output += " La scheda "+tempObj.name+" non ha nessuna descrizione" + " <break time=\"0.8s\"/> .";
                                }
                            }else{
                                //non c'è niente da dire.. la scheda non ha nome
                            }
                        }
                    }else{
                        check.output += "Nessuna scheda trovata";
                    }
                }    
            }else{
                check.output = "Per usare il connettore di Trello è necessario autenticarsi dall'applicazione";
            }
        }catch(error){
            check.output = error;
        }



        //Versione vecchia
        /*
        console.log("this.params: ", this.params);
        //Prova con Dialog
        if(this.params.length < 2){//ho solo il token
            //Chiedo all'utente da che bacheca vuole leggere
            console.log("GetCardsTrello params < 2");
            check.output = "Dimmi il nome della bacheca di Trello da dove vuoi leggere le tue schede";
            check.noInput = false;
        }else if(this.params.length ==2){ //ho il nome della bacheca
            boardNameSaidByUser = this.params[1];
            if(boardNameSaidByUser == ''){//nome vuoto
                this.params.splice(1,1);//rimuovo l'attuale valore vuoto presente in fondo e ricomincio
            }else{
                check.output = "Dimmi il nome della lista da dove vuoi leggere le tue schede";
            }
            check.noInput = false;
        }else if(this.params.length == 3){//ho il nome della lista
            listNameSaidByUser = this.params[2];
            if(listNameSaidByUser == ''){//nome lista vuoto
                this.params.splice(2,1);
                check.noInput = false;
            }else{
                check.noInput = true;
                tempBool = true;
            }
        }

        
        //qui comincia l'esecuzione se ho tutto le info
        if((boardNameSaidByUser !== '') && (listNameSaidByUser !== '') && (memberId !== '') && tempBool){
            try{
                console.log('boardNameSaidByUser: ', boardNameSaidByUser);
                console.log('listNameByUSer: ', listNameSaidByUser);
                console.log('numberOfCardsToRead: ',numberOfCardsToRead);
                
                //ottengo il memberId
                memberId = await httpGetMemberId();
                console.log('memberId: ', memberId);
        
                //si ottiene il JSON della bacheca voluta dall'utente
                tempBool = await getBoardWrapper(memberId);
                if(tempBool){//bacheca trovata
                    //si ottiene la lista che l'utente ha voluto
                    tempBool = await getListsFromBoard(trelloBoardId);
                    if(tempBool){//lista trovata
                        
                        //ottenere la descrizione delle schede della lista
                        tempBool = await getCardsOnList_Wrapper(objListOnBoard.id);
                        if(tempBool){//schede recuperate
                            for(let i=0; i< arrOfObjsSchede.length;++i){
                                tempObj = arrOfObjsSchede[i];
                                if(tempObj.name != ""){
                                    if(tempObj.desc != ""){
                                        check.output += " La scheda "+tempObj.name+" ha come descrizione " +tempObj.desc + " <break time=\"0.8s\"/> ";
                                    }else{//descrizione della scheda vuota
                                        check.output += " La scheda "+tempObj.name+" non ha nessuna descrizione" + " <break time=\"0.8s\"/> ";
                                    }
                                }else{
                                    //non c'è niente da dire.. la scheda non ha nome
                                }
                            }
                        }else{
                            check.output += "Nessuna scheda trovata";
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
        }else{
            //check.output += "Qualcosa è andato storto";
        }
        */
    
        console.log("ho check: ",JSON.stringify(check));
        return check;

        /*
        let promiseGetCardsOnBoard = () => {
            return new Promise(function (resolve, reject) {
                trello.getCardsOnBoard(boardId, function (error, data) {
                    if (error) {
                        console.log('errore - getCardsOnBoard: ',error);
                        reject('Impossibile leggere le schede');
                    }
                    else {
                        console.log('ho le schede getCardsOnBoard: ', data);
                        resolve('scheda 1 si chiama :'+data[0].name);
                    }
                });
            });
        };

        //it is possible to use await
        try{
            output = await promiseGetCardsOnBoard();
        }catch (error) {
            output = error;
        }

        return output;
        */
    }
}

exports.GetCardsFromBoardTrelloAction = GetCardsFromBoardTrelloAction;