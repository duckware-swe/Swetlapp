const AWS = require("aws-sdk");
var exports = module.exports = {};

let instance;

class DatabaseInteractor {
    constructor () {
        AWS.config.update({
            region: "eu-central-1",
            endpoint: "https://dynamodb.eu-central-1.amazonaws.com"
        });

        this.docClient = new AWS.DynamoDB.DocumentClient();
    }

    static getInstance () {
        if (instance===undefined) {
            instance = new DatabaseInteractor();
        }

        return instance;
    }

    /**
     *
     * @param params
     * @returns {Promise<any>}
     */
    query (params) {
        return new Promise((resolve, reject) => {
            this.docClient.query(params, function(err, data) {
                if (err) reject(err);

                resolve(data);
            })
        })
    }

    /**
     *
     * @param tableName
     * @param projectionExpression
     * @param keyName
     * @param keyValue
     * @returns {{TableName: *, ProjectionExpression: *, KeyConditionExpression: string, ExpressionAttributeValues: {":key": *}}}
     */
    static buildParams (tableName, projectionExpression, keyName, keyValue) {
        return {
            TableName: tableName,
            ProjectionExpression: projectionExpression,
            KeyConditionExpression: keyName + " = :key",
            ExpressionAttributeValues: {
                ":key": keyValue
            }
        };
    }
}

exports.getDatabaseInstance = DatabaseInteractor.getInstance;
exports.buildDatabaseParams = DatabaseInteractor.buildParams;