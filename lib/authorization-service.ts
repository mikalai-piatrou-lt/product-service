import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export class AuthorizationServiceStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const basicAuthorizerLambda  = new lambda.Function(this, 'basicAuthorizerHandler', {
            runtime: lambda.Runtime.NODEJS_22_X,
            handler: 'basicAuthorizer.handler',
            code: lambda.Code.fromAsset('lambda'),
            environment: {
                USER: process.env.user ?? '',
                PASSWORD: process.env.password ?? '',
            },
        });

        new cdk.CfnOutput(this, 'BasicAuthorizerLambdaArn', {
            value: basicAuthorizerLambda.functionArn,
            exportName: 'BasicAuthorizerLambdaArn',
        });
    }
}