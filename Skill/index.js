const {ReadFeedRSSAction} = require("./src/actions/ReadFeedRSSAction");
const {getWF} = require('./src/utils/db-util');
const {actionFactory} = require("./src/utils/actionFactory");

const Alexa = require('ask-sdk');
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
            const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
            sessionAttributes.username = response.username;
        }
        catch (error) {
            console.log(`Error message: ${error.message}`);
        }

        speechText = 'Ciao ' + handlerInput.attributesManager.getSessionAttributes().username +'! Benvenuto in swetlapp!';
            return handlerInput.responseBuilder
                .speak(speechText)
                .reprompt(speechText)
                .getResponse();
        //}
    }
};

//Helper Function for calling the Cognito /oauth2/userInfo to get user info using the accesstoken
let https = require('https');
// https is a default part of Node.JS.  Read the developer doc:  https://nodejs.org/api/https.html
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

const RunWorkflowHandler = {
    canHandle(handlerInput) {
        let request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'RunWorkflowIntent';
    },
    async handle(handlerInput) {
        let request = handlerInput.requestEnvelope.request;
        let workflowName =  request.intent.slots.workflow.value;
        let speechText = '';
        console.log(handlerInput.attributesManager.getSessionAttributes().username);
        console.log(workflowName);

        let actionList;
        await getWF('b60dabc1-78bc-487f-be8d-5a0ee9319a33', workflowName).then(
            data => actionList = JSON.parse(data)
        );

        speechText += 'Va bene, eseguo ' + JSON.stringify(workflowName) + '.';

        for(let i=0; i<actionList.actions_records.length; i++) {
            let action = actionList.actions_records[i];
            //console.log("Esecuzione azione: " + action.action);
            speechText += await actionFactory(action.action, action.params).run();
        }

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt("Puoi chiedermi di eseguire un altro workflow, oppure terminare la skill.")
            .getResponse();
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