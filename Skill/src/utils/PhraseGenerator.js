const {phrase} = require('./Phrase.json');
var exports = module.exports = {};

/**
 *
 * @param name {string}
 * @param params {JSON}
 * @returns {Action} Returns the appropriate Action depending on the the type of the action
 */
//TODO: serve il name nelle Actions???
function phraseGenerator(name, param) {
    switch (name) {
    	case "no_auth":
    		return phrase.noAuth[Math.floor(Math.random() * phrase.noAuth.length)];
    	case "start" 
    	    //start0 contiene il saluto e start1 contiene la presentazione
    		return phrase.start0[Math.floor(Math.random() * phrase.start0.length)] + param + phrase.start1[Math.floor(Math.random() * phrase.start1.length)];
        case "read_feed":
            return phrase.readFeed[Math.floor(Math.random() * phrase.readFeed.length)] + " " + param;
        case "read_tweet":
            return new TwitterReadAction(name, params);
        case "write_tweet":
            return new TwitterWriteAction(name, params);
        case "tv_schedule":
            return new TVScheduleAction(name, params);
        case "weather":
        	return new WeatherAction(name, params);
        case "add_trello_cards":
            return new AddCardTrelloAction(name,params);
        case "read_trello_cards":
            return new GetCardsFromBoardTrelloAction(name,params);
        default :
            throw "Unknown action";
    }
}

exports.actionFactory = actionFactory;