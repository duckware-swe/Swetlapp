const { Action } = require('../actions/Action');
const { CustomMessageAction } = require('../actions/CustomMessageAction');
const { ReadFeedRSSAction } = require('../actions/ReadFeedRSSAction.js');
const { TwitterReadAction } = require('../actions/TwitterReadAction.js');
const { TwitterWriteAction } = require('../actions/TwitterWriteAction.js');
const { TVScheduleAction } = require('../actions/TVScheduleAction.js');
const { WeatherAction } = require('../actions/WeatherAction.js');
/*const { AddCardTrelloAction } = require('../actions/AddCardTrelloAction');
const { GetCardsFromBoardTrelloAction } = require('../actions/GetCardsFromBoardTrelloAction');*/

var exports = module.exports = {};

/**
 *
 * @param name {string}
 * @param params {JSON}
 * @returns {Action} Returns the appropriate Action depending on the the type of the action
 */
function actionFactory(name, params) {
    switch (name) {
        case "custom_message":
            return new CustomMessageAction(params);
        case "read_feed":
            return new ReadFeedRSSAction(params);
        case "read_tweet":
            return new TwitterReadAction(params);
        case "write_tweet":
            return new TwitterWriteAction(params);
        case "tv_schedule":
            return new TVScheduleAction(params);
        case "weather":
        	return new WeatherAction(params);
        /*case "add_card_trello":
            return new AddCardTrelloAction(name,params);
        case "get_cards_on_board":
            return new GetCardsFromBoardTrelloAction(name,params);*/
        default :
            throw "Unknown action";
    }
}

exports.actionFactory = actionFactory;