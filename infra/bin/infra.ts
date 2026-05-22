#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { FreeAppApiStack } from '../lib/api-stack';
import { FreeAppAuthStack } from '../lib/auth-stack';
import { FreeAppClientStack } from '../lib/client-stack';
import { FreeAppDatabaseStack } from '../lib/database-stack';
import dotenv from 'dotenv';

dotenv.config();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

console.log('env', env);

const app = new cdk.App();

const clientStack = new FreeAppClientStack(app, 'FreeAppClientStack', {
  env,
});

const databaseStack = new FreeAppDatabaseStack(app, 'FreeAppDatabaseStack', {
  env,
});

const authStack = new FreeAppAuthStack(app, 'FreeAppAuthStack', {
  env,
  appUrl: clientStack.publicAppUrl,
});

const apiStack = new FreeAppApiStack(app, 'FreeAppApiStack', {
  env,
  usersTable: databaseStack.usersTable,
  userPool: authStack.userPool,
  userPoolClient: authStack.userPoolClient,
  allowedOrigins: [
    'http://localhost:5173',
    clientStack.publicAppUrl.replace(/\/+$/, ''),
  ],
});

apiStack.addDependency(databaseStack);
apiStack.addDependency(authStack);


