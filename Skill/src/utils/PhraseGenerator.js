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
    		const phrase = [
    			"Devi autenticarti con il tuo account <lang xml:lang=\"en-US\">SwetlApp</lang> per usare questa skill. Ti ho inviato le istruzioni nella tua <lang xml:lang=\"en-US\">App Alexa</lang>.",
    			"Mi dispiace ma per usare <lang xml:lang=\"en-US\">SwetlApp</lang> devi prima autenticarti. Se non sai come eseguire l\'autenticazione segui le istruzioni nella tua <lang xml:lang=\"en-US\">App Alexa</lang>."
    		];
    		return phrase[Math.floor(Math.random() * phrase.length)];
    	case "start" 
    		const phrase = [
    	        "Ciao "+param+", benvenuto in <lang xml:lang=\"en-US\">SwetlApp</lang>, come posso aiutarti?",
    	        "Benvenuto in <lang xml:lang=\"en-US\">SwetlApp</lang>",
    	        "Ciao "+param+" sei in <lang xml:lang=\"en-US\">SwetlApp</lang>, sono qui per aiutarti",
    	        "Benvenuto "+param+", sei in <lang xml:lang=\"en-US\">SwetlApp</lang>, come posso aiutarti?",
    	        "Ciao "+param" sei in <lang xml:lang=\"en-US\">SwetlApp</lang>, prova a far partire un <lang xml:lang=\"en-US\">workflow</lang>?"
    	    ],
    		return phrase[Math.floor(Math.random() * phrase.length)];
        case "read_feed":
        	const phrase = [
        		"Queste sono le notizie da "+ param + ": ",
        		"Ultime notizie di "+param+": ",
        		"Le ultime notizie di "+param+ " sono: ",
        		"Ecco le notizie da "+param+": "
        	]
            return phrase[Math.floor(Math.random() * phrase.length)];
        case "read_tweet":
        	const phrase = [
        		"Questi sono gli ultimi <lang xml:lang=\"en-US\">Tweet</lang> da "+ param + ": ",
        		"Ultimi <lang xml:lang=\"en-US\">Tweet</lang> di "+param+": ",
        		"Gli ultimi <lang xml:lang=\"en-US\">Tweet</lang> di "+param+ " sono: ",
        		"Ecco i <lang xml:lang=\"en-US\">Tweet</lang> pubblicati da "+param+": "
        	]
            return phrase[Math.floor(Math.random() * phrase.length)];
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