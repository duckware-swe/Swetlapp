const { Action } = require('./Action.js');
const Trello = require("trello");

var apiKey = '77b62a6bf6bde24b95bd2f7d28d7b226';
var token = 'a1a5b837de41f33a97f27b8afc716f0dbd0a8db35d51c77cafe95a1db9fdd333';
var trello = new Trello(apiKey, token);

let memberId; //id dell'utente
let boardsIDs=[]; //contiene gli ID tutte le bachece proprie dell'utente (nel caso serva)
let trelloBoardId ='';//id della bacheca che l'utente ha scelto a voce
let objBoard = {}; //oggetto JSON contiene tutto sulla bacheca voluta dall'utente
let objListOnBoard = {}; //oggetto JSON della lista che l'utente ha scelto
let listNameSaidByUser = 'In esecuzione';//nome lista detta dall'utente
let boardNameSaidByUser = 'Bacheca prova';//corpo della scheda che l'utente vuole aggiungere
let numberOfCardsToRead = 3; //Le prime 3 schede da leggere
let arrOfObjsSchede={}; //array di oggetti riguardanti le schede

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
        axios.get('https://api.trello.com/1/members/duckware')
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

                        if(toLowerCase(actualBoard.name) == toLowerCase(boardNameSaidByUser)){//se il nome  dela bacheca coincide con quello detto dall'utente
                            trelloBoardId = actualBoard.id; //ID della bacheca voluta dall'utente
                            /*if(!(trelloBoardId in objBoard)){//se la proprietà non è già presente
                                objBoard = tempJSON[i];//aggiunge la riga
                            }*/
                            objBoard = tempJSON[i];//JSON della bacheca voluta dall'utente   
                        }
                    }

                    //console.log('board:', JSON.stringify(objBoard), '\n');

                
                    resolve(true);//ritorna true nel caso si trovi la bacheca
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
                resolve('scheda aggiunta');

                let tempJSON = JSON.parse(JSON.stringify(lists));
                let actualList;
                let actualListId;
                
                for(let i=0; i < tempJSON.length;++i){ //ottengo gli id di tutti le bacheche che l'utente possiede
                    actualList = tempJSON[i];

                    if(toLowerCase(actualList.name) == toLowerCase(listNameSaidByUser)){//abbiamo trovato la lista che l'utente cercava
                        objListOnBoard = actualList;
                    }
                }

                console.log('lista trovata:', JSON.stringify(objListOnBoard));

                resolve(true);//successo
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
                console.log('\n ho le schede getCardsOnBoard: ', cards);

                /**
                 * Qua mi ritorna tutto l'object con tutte le schede della lista:
                 * 
                 * titolo scheda: name
                 * descrizione scheda: desc 
                 * 
                 */

                arrOfObjsSchede = JSON.parse(cards);
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
            noInput: true
        };
        let tempBool; //variabile temporanea
        
        /*
        let myListId = '5ca6817e91267628b5af5922'; //Id of the list where to add the card.. to be pulled from the parameters on Dynamo Db
        let boardId = '5ca6817e46cec324aeed2dc9';
        */

        try{
            //ottengo il memberId
            memberId = await httpGetMemberId();

            //si ottiene il JSON della bacheca voluta dall'utente
            tempBool = await getBoardWrapper(memberId);
            if(tempBool){//bacheca trovata
                //si ottiene la lista che l'utente ha voluto
                tempBool = await getListsFromBoard(trelloBoardId);
                if(tempBool){//lista trovata
                    //ottenere la descrizione delle schede della lista
                    let tempObj;
                    for(i=0; i< arrOfObjsSchede.length;++i){
                        tempObj = arrOfObjsSchede[i];
                        if(tempObj.name != ""){
                            if(tempObj.desc != ""){
                                check.output += "La scheda "+tempObj.name+" ha come descrizione " +tempObj.desc;
                            }else{//descrizione della scheda vuota
                                check.output += "La scheda "+tempObj.name+" non ha nessuna descrizione";
                            }
                        }else{
                            //non c'è niente da dire
                        }
                    }
                }else{
                    //lista non trovata
                }
            }else{
                //Qua dire all'utente che la bacheca scelta non è stata trovata
            }
        }catch(error){
            check.output = error;
        }

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