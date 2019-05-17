var exports = module.exports = {};

/**
 *
 * @param name {string}
 * @param params {JSON}
 * @returns {Action} Returns the appropriate Action depending on the the type of the action
 */
//TODO: serve il name nelle Actions???
function phraseGenerator(name, param) {
	let phrase = [];
    switch (name) {
    	case "no_auth":
    		phrase.push("Devi autenticarti con il tuo account <lang xml:lang=\"en-US\">SwetlApp</lang> per usare questa skill. Ti ho inviato le istruzioni nella tua <lang xml:lang=\"en-US\">App Alexa</lang>.");
    		phrase.push("Mi dispiace ma per usare <lang xml:lang=\"en-US\">SwetlApp</lang> devi prima autenticarti. Se non sai come eseguire l\'autenticazione segui le istruzioni nella tua <lang xml:lang=\"en-US\">App Alexa</lang>.");
    	    return phrase[Math.floor(Math.random() * phrase.length)];
    	case "start":
    		phrase.push("Ciao "+param+", benvenuto in <lang xml:lang=\"en-US\">SwetlApp</lang>, come posso aiutarti? ");
    		phrase.push("Benvenuto in <lang xml:lang=\"en-US\">SwetlApp</lang>. ");
    		phrase.push("Ciao "+param+", questa è <lang xml:lang=\"en-US\">SwetlApp</lang>, come posso esserti utile? ");
    		phrase.push("Benvenuto "+param+", questa è <lang xml:lang=\"en-US\">SwetlApp</lang>, come posso aiutarti? ");
    		phrase.push("Ciao "+param+", sei in <lang xml:lang=\"en-US\">SwetlApp</lang>, prova a far partire un <lang xml:lang=\"en-US\">workflow</lang>. ");
    	    return phrase[Math.floor(Math.random() * phrase.length)];
    	case "start_WF":
    		phrase.push("Va bene, eseguo "+param+". ");
    		phrase.push("Eseguo "+param+". ");
    		phrase.push("Comincio "+param+". ");
    		phrase.push("D'accordo, avvio "+param+". ");
    		phrase.push("Inizio "+param+". ");
    		phrase.push("Comincio il <lang xml:lang=\"en-US\">workflow</lang> "+param+". ");
    	    return phrase[Math.floor(Math.random() * phrase.length)];
        case "read_feed":
        	phrase.push("Queste sono le notizie da "+ param + ": ");
        	phrase.push("Ultime notizie di "+param+": ");
        	phrase.push("Le ultime notizie di "+param+ " sono: ");
        	phrase.push("Ecco le notizie da "+param+": ");
            return phrase[Math.floor(Math.random() * phrase.length)];
        case "home_tweet":
        	phrase.push("Questi sono gli ultimi <lang xml:lang=\"en-US\">Tweet</lang> nella tua <lang xml:lang=\"en-US\">Home</lang>: ");
        	phrase.push("Ultimi <lang xml:lang=\"en-US\">Tweet</lang> ricevuti : ");
        	phrase.push("Gli ultimi <lang xml:lang=\"en-US\">Tweet</lang> ricevuti sono: ");
        	phrase.push("Ecco i <lang xml:lang=\"en-US\">Tweet</lang> nella tua <lang xml:lang=\"en-US\">Home</lang>: ");
            return phrase[Math.floor(Math.random() * phrase.length)];
        case "read_tweet":
        	phrase.push("Questi sono gli ultimi <lang xml:lang=\"en-US\">Tweet</lang> da "+ param + ": ");
        	phrase.push("Ultimi <lang xml:lang=\"en-US\">Tweet</lang> di "+param+": ");
        	phrase.push("Gli ultimi <lang xml:lang=\"en-US\">Tweet</lang> di "+param+ " sono: ");
        	phrase.push("Ecco i <lang xml:lang=\"en-US\">Tweet</lang> pubblicati da "+param+": ");
            return phrase[Math.floor(Math.random() * phrase.length)];
        case "write_tweet":
        	phrase.push("Dimmi, che <lang xml:lang=\"en-US\">Tweet</lang> vuoi pubblicare? ");
        	phrase.push("Che cosa vuoi pubblicare? ");
        	phrase.push("Dimmi, che cosa vuoi pubblicare? ");
        	phrase.push("Che <lang xml:lang=\"en-US\">Tweet</lang> vuoi inviare? ");
        	phrase.push("Dimmi il testo del <lang xml:lang=\"en-US\">Tweet</lang> che vuoi inviare. ");
            return phrase[Math.floor(Math.random() * phrase.length)];
        case "confirm_tweet":
        	phrase.push(param+", è questo quello che vuoi pubblicare? ");
        	phrase.push(param+", è questo quello che vuoi inviare? ");
        	phrase.push(param+", confermi l\'invio? ");
        	phrase.push("Mi confermi di aver detto: "+param+"? ");
        	phrase.push("Hai detto: "+param+", giusto? ");
        	phrase.push("Confermi: "+param+"? ");
        	phrase.push("Vuoi inviare: "+param+"? ");
            return phrase[Math.floor(Math.random() * phrase.length)];
        case "tweet_success":
        	phrase.push("<lang xml:lang=\"en-US\">Tweet</lang> inviato con successo. ");
        	phrase.push("<lang xml:lang=\"en-US\">Tweet</lang> pubblicato con successo. ");
        	phrase.push("Ho inviato il <lang xml:lang=\"en-US\">Tweet</lang>. ");
        	phrase.push("Ho inviato il <lang xml:lang=\"en-US\">Tweet</lang> richiesto. ");
        	phrase.push("Ho pubblicato il <lang xml:lang=\"en-US\">Tweet</lang>. ");
        	phrase.push("Ho pubblicato il <lang xml:lang=\"en-US\">Tweet</lang> richiesto. ");
        	return phrase[Math.floor(Math.random() * phrase.length)];
        case "tv_ask_channel":
        	phrase.push("di quale canale vuoi sapere la programmazione? ");
            phrase.push("dimmi il canale della quale vuoi conoscere la programmazione. ");
            phrase.push("qual è il canale che ti interessa? ");
            return phrase[Math.floor(Math.random() * phrase.length)];
        case "tv_ask_time":
            phrase.push("a partire da che ora? ");
            phrase.push("dimmi un orario di inizio. ");
            return phrase[Math.floor(Math.random() * phrase.length)];
        case "tv_completed":
            phrase.push("la programmazione per "+param[0]+" dalle ore "+param[1]+", è:");
            phrase.push("questa è la programmazione di "+param[0]+" dalle ore "+param[1]+" : ");
            phrase.push("questi sono i programmi che andranno in onda su "+param[0]+" a partire dalle ore "+param[1]+" : ");
            return phrase[Math.floor(Math.random() * phrase.length)];
        case "tv_empty":
            phrase.push("la programmazione per "+param[0]+" dalle ore "+param[1]+" risulta essere vuota. ");
            phrase.push("non ci sono programmi nel palinsesto di "+param[0]+" dalle ore "+param[1]+". ");
            return phrase[Math.floor(Math.random() * phrase.length)];
        case "weather":
        	phrase.push("Le previsioni per "+param+" sono: ");
        	phrase.push("Oggi a "+param+" è: ");
        	phrase.push("A "+param+" è: ");
        	phrase.push("A "+param+" il tempo è: ");
            return phrase[Math.floor(Math.random() * phrase.length)];
        case "add_trello_cards":
        	phrase.push(" ");
            return phrase[Math.floor(Math.random() * phrase.length)];
        case "read_trello_cards":
        	phrase.push(" ");
            return phrase[Math.floor(Math.random() * phrase.length)];
        case "stop":
            phrase.push("a presto.");
            phrase.push("arrivederci.");
            phrase.push("buona giornata.");
            phrase.push("arrivederci, a presto.");
            return phrase[Math.floor(Math.random() * phrase.length)];
        case "answer_error":
            phrase.push("Scusa, non ho capito, puoi ripetere la risposta? ");
            phrase.push("Temo di non aver capito la risposta, puoi ripetere? ");
            phrase.push("Purtroppo non ho capito la risposta. Per favore, ripeti. ");
            phrase.push("Temo di non aver capito. gentilmente, ripeti la risposta. ");
            return phrase[Math.floor(Math.random() * phrase.length)];
        default :
            throw "Unknown action";
    }
}

exports.phraseGenerator = phraseGenerator;