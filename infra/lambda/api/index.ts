import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import serverlessExpress from '@vendia/serverless-express';
import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { createApp } from './app';

const tableName = process.env.USERS_TABLE_NAME;
if (!tableName) {
    throw new Error('USERS_TABLE_NAME environment variable is required');
}

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const app = createApp({ docClient, tableName });
const serverlessExpressInstance = serverlessExpress({ app });

export const handler: APIGatewayProxyHandlerV2 = (event, context, callback) =>
    serverlessExpressInstance(event, context, callback);
