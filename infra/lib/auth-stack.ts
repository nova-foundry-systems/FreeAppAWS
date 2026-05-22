import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';

export interface FreeAppAuthStackProps extends cdk.StackProps {
    /** OAuth callback and sign-out URL (e.g. client stack `publicAppUrl`: CloudFront HTTPS origin). */
    appUrl: string;
}

export class FreeAppAuthStack extends cdk.Stack {
    public readonly userPool: cognito.UserPool;
    public readonly userPoolClient: cognito.UserPoolClient;

    constructor(scope: Construct, id: string, props: FreeAppAuthStackProps) {
        super(scope, id, props);

        this.userPool = new cognito.UserPool(this, 'FreeAppUserPool', {
            selfSignUpEnabled: true,
            signInAliases: { email: true },
            autoVerify: { email: true },
        });

        const appOrigin = props.appUrl.replace(/\/+$/, '');

        const domainPrefix = `fa-${cdk.Stack.of(this).stackName.toLowerCase().replace(/[^a-z0-9]/g, '')}`.slice(
            0,
            63,
        );

        const userPoolDomain = this.userPool.addDomain('FreeAppUserPoolDomain', {
            cognitoDomain: {
                domainPrefix,
            },
        });

        this.userPoolClient = this.userPool.addClient('FreeAppUserPoolClient', {
            generateSecret: false,
            supportedIdentityProviders: [
                cognito.UserPoolClientIdentityProvider.COGNITO,
            ],
            authFlows: {
                userSrp: true,
            },
            oAuth: {
                flows: {
                    authorizationCodeGrant: true,
                },
                scopes: [
                    cognito.OAuthScope.EMAIL,
                    cognito.OAuthScope.OPENID,
                    cognito.OAuthScope.PROFILE,
                ],
                callbackUrls: ['http://localhost:5173/callback', `${appOrigin}/callback`],
                logoutUrls: ['http://localhost:5173', appOrigin],
            },
        });

        const issuer = `https://cognito-idp.${this.region}.amazonaws.com/${this.userPool.userPoolId}`;

        new cdk.CfnOutput(this, 'FreeAppUserPoolId', {
            value: this.userPool.userPoolId,
            exportName: 'FreeAppUserPoolId',
        } as cdk.CfnOutputProps);

        new cdk.CfnOutput(this, 'FreeAppUserPoolClientId', {
            value: this.userPoolClient.userPoolClientId,
            exportName: 'FreeAppUserPoolClientId',
        } as cdk.CfnOutputProps);

        new cdk.CfnOutput(this, 'FreeAppUserPoolIssuer', {
            value: issuer,
            exportName: 'FreeAppUserPoolIssuer',
        } as cdk.CfnOutputProps);

        new cdk.CfnOutput(this, 'FreeAppCognitoHostedUiUrl', {
            value: userPoolDomain.baseUrl(),
            exportName: 'FreeAppCognitoHostedUiUrl',
        } as cdk.CfnOutputProps);

        new cdk.CfnOutput(this, 'FreeAppUserPoolDomainHost', {
            value: userPoolDomain.domainName,
            exportName: 'FreeAppUserPoolDomainHost',
        } as cdk.CfnOutputProps);
    }
}
