#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { FreeAppClientStack } from '../lib/client-stack';
import dotenv from 'dotenv';

dotenv.config();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

console.log('env', env);

const app = new cdk.App();
new FreeAppClientStack(app, 'FreeAppClientStack', {
  env,
});
