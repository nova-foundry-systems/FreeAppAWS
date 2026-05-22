import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';

export class FreeAppDatabaseStack extends cdk.Stack {
    public readonly usersTable: dynamodb.Table;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        this.usersTable = new dynamodb.Table(this, 'FreeAppUsers', {
            partitionKey: {
                name: 'cognitoSub',
                type: dynamodb.AttributeType.STRING,
            },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        new cdk.CfnOutput(this, 'FreeAppUsersTableName', {
            value: this.usersTable.tableName,
            exportName: 'FreeAppUsersTableName',
        } as cdk.CfnOutputProps);
    }
}
