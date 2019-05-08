const https = require('https');
const Alexa = require('ask-sdk');
const {actionFactory} = require("./src/utils/ActionFactory");
const {getDatabaseInstance, buildDatabaseParams} = require("./src/DatabaseInteractor");

const appName = 'SwetlApp';

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    async handle(handlerInput) {
        const { accessToken } = handlerInput.requestEnvelope.context.System.user;
        let speechText = '';

        if (!accessToken) {
            speechText = 'Devi autenticarti con il tuo account Swetlapp per usare questa skill. Ti ho inviato le istruzioni nella tua App Alexa.';
            return handlerInput.responseBuilder
                .speak(speechText)
                .withLinkAccountCard()
                .getResponse();
        }
        try {
            let tokenOptions = buildHttpGetOptions(accessToken);

            let response = await httpGet(tokenOptions);
            console.log({ response });
            console.log('Username:' + response.username);
            //console.log('Username:' + response.id);
            const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
            sessionAttributes.username = response.username;
        }
        catch (error) {
            console.log(`Error message: ${error.message}`);
        }

        speechText = 'Ciao ' + handlerInput.attributesManager.getSessionAttributes().username + "! Benvenuto in " + appName;
            return handlerInput.responseBuilder
                .speak(speechText)
                .reprompt(speechText)
                .getResponse();
        //}
    }
};

//Helper Function for calling the Cognito /oauth2/userInfo to get user info using the accesstoken
function buildHttpGetOptions(accessToken) {
    return {
        //Replace the host with your cognito user pool domain
        host: 'swetlapp.auth.eu-central-1.amazoncognito.com',
        port: 443,
        path: '/oauth2/userInfo',
        method: 'GET',
        headers: {
            'authorization': 'Bearer ' + accessToken
        }
    };
}

function httpGet(options) {
    return new Promise(((resolve, reject) => {
        let request = https.request(options, (response) => {
            response.setEncoding('utf8');
            let returnData = '';

            if (response.statusCode < 200 || response.statusCode >= 300) {
                return reject(new Error(`${response.statusCode}: ${response.req.getHeader('host')} ${response.req.path}`));
            }

            response.on('data', (chunk) => {
                returnData += chunk;
            });

            response.on('end', () => {
                console.log({ returnData });
                resolve(JSON.parse(returnData));
            });

            response.on('error', (error) => {
                reject(error);
            });
        });
        request.end();
    }));
}

function getWF(username, idWF) {
    let params = buildDatabaseParams(
        "User-tevi37ekkbfvjgpusicgsjpt5m-testcog",
        "workflow",
        "id",
        username
    );

    return getDatabaseInstance().query(params).then(
        data => {
            if(data.Count === 0) return null;

            let hit = data.Items[0].workflow.find(i => i.name === idWF);

            if (hit) return hit.def;

            return null;
        },
        () => null
    );
}

const RunWorkflowHandler = {
    canHandle(handlerInput) {
        let request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' 
        	&& request.intent.name === 'RunWorkflowIntent' 
            && request.dialogState === 'STARTED';
    },
    async handle(handlerInput) {
    	console.log("entro in RunWork");
    	let request = handlerInput.requestEnvelope.request;
        let workflowName = request.intent.slots.workflow.value;
        let speechText = '';
        let username = handlerInput.attributesManager.getSessionAttributes().username;
        let response;
        console.log(request.intent);
        let check = {
        		output: '',
        		noInput: true
        };
        let actionList;
        await getWF(username, workflowName).then(
            data => actionList = JSON.parse(data)
        );
        
        speechText += 'Va bene, eseguo ' + JSON.stringify(workflowName) + '. ';
        let i=0;
        for(; i<actionList.actions_records.length && check.noInput; i++) {
            let action = actionList.actions_records[i];
            //console.log("Esecuzione azione: " + action.action);
            try {
            	check = await actionFactory(action.action, action.params).run();
                //speechText += await actionFactory(action.action, action.params).run();
            	speechText += check.output+ ". ";
            } catch (e) {
                speechText += "Azione non riconosciuta";
            }
        }
        //se check.noInput è falso allora di sicuro non ho finito il WF e devo continuare il dialogo con l'utente
        if(!check.noInput){
	        //salvo la lista di azioni
	        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
	        sessionAttributes.actionList = actionList;
	        
	        //salvo la posizione
		    const sessionAttributes2 = handlerInput.attributesManager.getSessionAttributes();
		    sessionAttributes.index = --i;	        	
	        
	        //il dialogo diventa IN_PROGRESS
	        request.dialogState = 'IN_PROGRESS';
	        
	        console.log("provo a fare addElicit");
	        try{
	        //la risposta si aspetta che l'utente dia un valore per elicitSlot
	        response = handlerInput.responseBuilder
            .speak(speechText)
            .reprompt('')
            .addElicitSlotDirective('payload',request.intent)
            .getResponse();
	        }catch(e){
	        	console.log(e.message);
	        	response = handlerInput.responseBuilder
	            .speak('Ho fatto un casino')
	            .reprompt('')
	            .getResponse();
	        }
        }else{
        	response = handlerInput.responseBuilder
            .speak(speechText)
            .reprompt('')
            .getResponse();
        }
        try{
        return response;
        }catch(e){
        	console.log(e.message);
        	return handlerInput.responseBuilder
            .speak('Non ho imposato bene dialog')
            .reprompt('')
            .getResponse();
        }
    	/*return handlerInput.responseBuilder
        .speak('robbbe')
        .reprompt('rirobbe')
        .getResponse();*/
    }
};

const InProgressRunWorkflowHandler = {
    canHandle(handlerInput) {
        let request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.dialogState === 'IN_PROGRESS'
            && handlerInput.attributesManager.getSessionAttributes().index;
        //TODO controllare intent name?
    },
    async handle(handlerInput) {
    	console.log("avvio inProgress");
    	let request = handlerInput.requestEnvelope.request;
        let elicitSlot =  request.intent.slots.payload.value;
        let speechText = '';
        let check = {
        		output: '',
        		noInput: true
        };
        let response;
        console.log(request.intent);
        let actionList = handlerInput.attributesManager.getSessionAttributes().actionList;
        let i = handlerInput.attributesManager.getSessionAttributes().index;
        
        if(elicitSlot){
        	actionList.actions_records[i].params.push(elicitSlot);
        	//faccio partire il WF solo se ho ottenuto una risposta giusta
        	for(; i<actionList.actions_records.length && check.noInput; i++) {
	            let action = actionList.actions_records[i];
	            //console.log("Esecuzione azione: " + action.action);
	            try {
	            	check = await actionFactory(action.action, action.params).run();
	                //speechText += await actionFactory(action.action, action.params).run();
	            	speechText += check.output+ ". ";
	            } catch (e) {
	                speechText += "Azione non riconosciuta";
	            }
	        }
        }else{
        	let speechText = 'Scusa, puoi ripetere?';
        }      
        
        if(!check.noInput){
	        //salvo la lista di azioni
	        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
	        sessionAttributes.actionList = actionList;
	        
	        //salvo la posizione
	        const sessionAttributes2 = handlerInput.attributesManager.getSessionAttributes();
	        sessionAttributes.index = --i;
	        
	        //il dialogo diventa IN_PROGRESS
	        request.dialogState = 'IN_PROGRESS';
	        
	        //la risposta si aspetta che l'utente dia un valore per elicitSlot
	        response = handlerInput.responseBuilder
            .speak(speechText)
            .reprompt('')
            .addElicitSlotDirective('payload',request.intent)
            .getResponse();
        }else{
        	response = handlerInput.responseBuilder
            .speak(speechText)
            .reprompt('')
            .getResponse();
        }
        return response;
    }
};

const WorkflowRepeatHandler = {
    canHandle(handlerInput){
        let request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'RepeatWorkflowIntent';
    },
    handle(handlerInput) {
        let request = handlerInput.requestEnvelope.request;
        var workflowName =  request.intent.slots.workflow.value;
        const speechText = 'Va bene, ripeto il workflow' + workflowName;

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .withSimpleCard(appName, speechText)
            .getResponse();
    }
};

const StopIntentHandler = {
    canHandle(handlerInput) {
        let request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.StopIntent';
    },
    handle(handlerInput) {
        const speechText = 'A presto';

        return handlerInput.responseBuilder
            .speak(speechText)
            .withSimpleCard(appName, speechText)
            .getResponse();
    }
};

const CancelIntent = {
    canHandle(handlerInput) {
        let request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.CancelIntent';
    },
    handle(handlerInput) {
        const speechText = 'Hai annullato il workflow';
        const repromptText = 'Come posso aiutarti?';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(repromptText)
            .withSimpleCard(appName, speechText)
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        let request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speechText = 'Puoi eseguire i workflow creati nell\'app, prova a dire: esegui Roberto';
        const repromptText = 'Prova a chiedermi di eseguire un workflow che hai creato nell\'app';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(repromptText)
            .withSimpleCard(appName, speechText)
            .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        //any cleanup logic goes here
        return handlerInput.responseBuilder.getResponse();
    }
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        //console.log(`Error handled: ${error.message}`);

        return handlerInput.responseBuilder
            .speak('Scusa, non ho capito. Puoi ripetere?')
            .reprompt('Non ho capito il comando. Prova a chiedere aiuto.')
            .getResponse();
    },
};

let skill;

exports.handler = async function (event, context) {
    //console.log(`REQUEST++++${JSON.stringify(event)}`);
    if (!skill) {
        skill = Alexa.SkillBuilders.standard()
            .addRequestHandlers(
                LaunchRequestHandler,
                RunWorkflowHandler,
                InProgressRunWorkflowHandler,
                WorkflowRepeatHandler,
                HelpIntentHandler,
                CancelIntent,
                StopIntentHandler,
                SessionEndedRequestHandler
            )
            .addErrorHandlers(ErrorHandler)
            .create();
    }

    const response = await skill.invoke(event, context);
    //console.log(`RESPONSE++++${JSON.stringify(response)}`);

    return response;
};