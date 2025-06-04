import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { S3EventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { Construct } from 'constructs';
import { CORS_OPTIONS } from '../lambda/utils';

export class ImportServiceStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const importBucket = new s3.Bucket(this, "ImportBucket", {
            versioned: true,
            cors: [
                {
                    allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT],
                    allowedOrigins: ["*"],
                    allowedHeaders: ["*"],
                    maxAge: 3000,
                },
            ],
        });

        //import existing SQS Queue URL and ARN from ProductServiceStack
        const catalogItemsQueueUrl = cdk.Fn.importValue('CatalogItemsQueueUrl');
        const catalogItemsQueueArn = cdk.Fn.importValue('CatalogItemsQueueArn');

        const importProductsFileLambda = new lambda.Function(this, 'importProductsFileHandler', {
            runtime: lambda.Runtime.NODEJS_22_X,
            handler: 'importProductsFile.handler',
            code: lambda.Code.fromAsset('lambda'),
            environment: {
                BUCKET_NAME: importBucket.bucketName,
            },
        });

        importBucket.grantReadWrite(importProductsFileLambda);

        // API Gateway
        const api = new apigateway.RestApi(this, 'ImportServiceApi', {
            restApiName: 'Import Service',
            description: 'This service imports products files.',
        });

        //import existing authorizer function
        const authorizerLambdaArn = cdk.Fn.importValue("BasicAuthorizerLambdaArn");

        const authorizerLambda = lambda.Function.fromFunctionAttributes(
            this,
            "ImportedAuthorizerLambda",
            {
                functionArn: authorizerLambdaArn,
                sameEnvironment: true,
            }
        );

        const basicAuthorizer = new apigateway.TokenAuthorizer(
            this,
            "BasicTokenAuthorizer",
            {
                handler: authorizerLambda,
                identitySource: apigateway.IdentitySource.header("Authorization"),
            }
        );

        const importProducts = api.root.addResource('import');
        importProducts.addCorsPreflight(CORS_OPTIONS);
        const importProductsIntegration = new apigateway.LambdaIntegration(importProductsFileLambda);
        importProducts.addMethod('GET', importProductsIntegration, {
            authorizer: basicAuthorizer,
        });

        const importFileParserLambda = new lambda.Function(this, 'importFileParserHandler', {
            runtime: lambda.Runtime.NODEJS_22_X,
            handler: 'importFileParser.handler',
            code: lambda.Code.fromAsset('lambda'),
            environment: {
                BUCKET_NAME: importBucket.bucketName,
                QUEUE_URL: catalogItemsQueueUrl,
            },
        });

        importBucket.grantReadWrite(importFileParserLambda);
        //permission to send messages from SQS to lambda
        importFileParserLambda.addToRolePolicy(new cdk.aws_iam.PolicyStatement({
            actions: ['sqs:SendMessage'],
            resources: [catalogItemsQueueArn],
        }));

        // Configure S3 event to trigger importFileParserLambda
        importFileParserLambda.addEventSource(new S3EventSource(importBucket, {
            events: [s3.EventType.OBJECT_CREATED],
            filters: [{ prefix: 'uploaded/' }],
        }));

    }
}