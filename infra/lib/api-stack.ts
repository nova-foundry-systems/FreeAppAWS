import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigatewayv2_authorizers from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import * as apigatewayv2_integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cdk from 'aws-cdk-lib/core';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as path from 'node:path';

export interface FreeAppApiStackProps extends cdk.StackProps {
    usersTable: dynamodb.ITable;
    userPool: cognito.IUserPool;
    userPoolClient: cognito.IUserPoolClient;
    allowedOrigins: string[];
}

export class FreeAppApiStack extends cdk.Stack {
    public readonly apiUrl: string;

    constructor(scope: Construct, id: string, props: FreeAppApiStackProps) {
        super(scope, id, props);

        const lambdaRoot = path.join(__dirname, '..', 'lambda', 'api');

        const apiHandler = new NodejsFunction(this, 'FreeAppApiHandler', {
            projectRoot: lambdaRoot,
            depsLockFilePath: path.join(lambdaRoot, 'package-lock.json'),
            entry: path.join(lambdaRoot, 'index.ts'),
            handler: 'handler',
            runtime: lambda.Runtime.NODEJS_22_X,
            environment: {
                USERS_TABLE_NAME: props.usersTable.tableName,
            },
        });

        props.usersTable.grantReadWriteData(apiHandler);

        const httpApi = new apigatewayv2.HttpApi(this, 'FreeAppHttpApi', {
            corsPreflight: {
                allowOrigins: props.allowedOrigins,
                allowMethods: [
                    apigatewayv2.CorsHttpMethod.GET,
                    apigatewayv2.CorsHttpMethod.POST,
                    apigatewayv2.CorsHttpMethod.OPTIONS,
                ],
                allowHeaders: ['Authorization', 'Content-Type'],
            },
        });

        const poolId = props.userPool.userPoolId;
        const poolRegion = poolId.includes('_') ? poolId.split('_')[0]! : this.region;
        const issuer = `https://cognito-idp.${poolRegion}.amazonaws.com/${poolId}`;

        const authorizer = new apigatewayv2_authorizers.HttpJwtAuthorizer('FreeAppJwtAuthorizer', issuer, {
            jwtAudience: [props.userPoolClient.userPoolClientId],
        });

        const integration = new apigatewayv2_integrations.HttpLambdaIntegration(
            'FreeAppApiIntegration',
            apiHandler,
        );

        const routeOptions = {
            integration,
            authorizer,
        };

        httpApi.addRoutes({
            path: '/users/me',
            methods: [apigatewayv2.HttpMethod.GET, apigatewayv2.HttpMethod.POST],
            ...routeOptions,
        });

        this.apiUrl = httpApi.apiEndpoint ?? '';

        new cdk.CfnOutput(this, 'FreeAppApiUrl', {
            value: this.apiUrl,
            exportName: 'FreeAppApiUrl',
        } as cdk.CfnOutputProps);
    }
}
