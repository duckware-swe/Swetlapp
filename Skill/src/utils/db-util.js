const AWS = require("aws-sdk");

var exports = module.exports = {};

function getWF(username, idWF) {
    AWS.config.update({
        region: "eu-central-1",
        endpoint: "https://dynamodb.eu-central-1.amazonaws.com"
    });

    let docClient = new AWS.DynamoDB.DocumentClient();

    let params = {
        TableName : "User-tevi37ekkbfvjgpusicgsjpt5m-testcog",
        ProjectionExpression:"workflow",
        KeyConditionExpression: "id = :usr",
        ExpressionAttributeValues: {
            ":usr": username
        }
    };


    return new Promise(function(resolve, reject) {
        docClient.query(params, function(err, data) {
            if (err) {
                reject(err);
            } else {
                if(data.Count === 0) {
                    reject(null);
                }

                console.log("DATA: " + data.Count);
                let hit = data.Items[0].workflow.find(i => i.name === idWF);

                if (hit) {
                    resolve(hit.def);
                }
                else {
                    reject(null);
                }
            }
        });
    });
}

exports.getWF = getWF;