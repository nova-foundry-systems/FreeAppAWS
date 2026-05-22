import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { getCurrentInvoke } from '@vendia/serverless-express';
import express from 'express';

export interface AppDeps {
    docClient: DynamoDBDocumentClient;
    tableName: string;
}

function getCognitoSub(): string | undefined {
    const event = getCurrentInvoke()?.event as
        | { requestContext?: { authorizer?: { jwt?: { claims?: Record<string, string> } } } }
        | undefined;
    const sub = event?.requestContext?.authorizer?.jwt?.claims?.sub;
    return typeof sub === 'string' ? sub : undefined;
}

function parseName(value: unknown): string | null {
    if (typeof value !== 'string') {
        return null;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

export function createApp({ docClient, tableName }: AppDeps) {
    const app = express();
    app.use(express.json());

    app.get('/users/me', async (req, res) => {
        const cognitoSub = getCognitoSub(req);
        if (!cognitoSub) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const result = await docClient.send(
            new GetCommand({
                TableName: tableName,
                Key: { cognitoSub },
            }),
        );

        if (!result.Item) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const { firstName, lastName } = result.Item;
        res.json({ cognitoSub, firstName, lastName });
    });

    app.post('/users/me', async (req, res) => {
        const cognitoSub = getCognitoSub(req);
        if (!cognitoSub) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const firstName = parseName(req.body?.firstName);
        const lastName = parseName(req.body?.lastName);

        if (!firstName || !lastName) {
            res.status(400).json({ message: 'firstName and lastName are required' });
            return;
        }

        try {
            await docClient.send(
                new PutCommand({
                    TableName: tableName,
                    Item: { cognitoSub, firstName, lastName },
                    ConditionExpression: 'attribute_not_exists(cognitoSub)',
                }),
            );
            res.status(201).json({ cognitoSub, firstName, lastName });
        } catch (err) {
            if (err instanceof ConditionalCheckFailedException) {
                res.status(409).json({ message: 'User already exists' });
                return;
            }
            throw err;
        }
    });

    return app;
}
