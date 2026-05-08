import * as fs from 'node:fs';
import * as path from 'node:path';
import { execSync } from 'node:child_process';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cdk from 'aws-cdk-lib/core';
import { DockerImage } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';

const clientRoot = path.join(__dirname, '..', '..', 'client');

function clientSiteSource(): s3deploy.ISource {
    return s3deploy.Source.asset(clientRoot, {
        exclude: ['node_modules', 'dist', '.git'],
        bundling: {
            image: DockerImage.fromRegistry('node:22-bookworm-slim'),
            command: [
                'bash',
                '-c',
                'cd /asset-input && npm ci && npm run build && cp -r dist/. /asset-output/',
            ],
            local: {
                tryBundle(outputDir: string): boolean {
                    try {
                        execSync('npm ci && npm run build', {
                            cwd: clientRoot,
                            stdio: 'inherit',
                        });
                        fs.cpSync(path.join(clientRoot, 'dist'), outputDir, {
                            recursive: true,
                        });
                        return true;
                    } catch {
                        return false;
                    }
                },
            },
        },
    });
}

export class FreeAppClientStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const freeAppClientBucket = new s3.Bucket(this, 'FreeAppClientBucket', {
            bucketName: 'free-app-client-bucket',
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
        });

        const distribution = new cloudfront.Distribution(this, 'FreeAppClientDistribution', {
            defaultBehavior: {
                origin: origins.S3BucketOrigin.withOriginAccessControl(freeAppClientBucket),
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            },
            defaultRootObject: 'index.html',
            errorResponses: [
                {
                    httpStatus: 403,
                    responseHttpStatus: 200,
                    responsePagePath: '/index.html',
                    ttl: cdk.Duration.seconds(0),
                },
                {
                    httpStatus: 404,
                    responseHttpStatus: 200,
                    responsePagePath: '/index.html',
                    ttl: cdk.Duration.seconds(0),
                },
            ],
        });

        new s3deploy.BucketDeployment(this, 'DeployClient', {
            sources: [clientSiteSource()],
            destinationBucket: freeAppClientBucket,
            distribution,
            distributionPaths: ['/*'],
            prune: true,
        });

        new cdk.CfnOutput(this, 'DistributionDomainName', {
            value: distribution.distributionDomainName,
            exportName: 'FreeAppClientDistributionDomainName',
        } as cdk.CfnOutputProps);
    }
}