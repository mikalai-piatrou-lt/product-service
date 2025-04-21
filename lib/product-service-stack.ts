import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

// FE URL
const FRONTEND_URL = 'https://d31cdo0fo49iqu.cloudfront.net';

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Lambda for getProductsList
    const getProductsListLambda = new lambda.Function(this, 'getProductsListHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'getProductsList.handler',
      code: lambda.Code.fromAsset('lambda'),
    });

    // Lambda for getProductsById
    const getProductsByIdLambda = new lambda.Function(this, 'getProductsByIdHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'getProductsById.handler',
      code: lambda.Code.fromAsset('lambda'),
    });

    // API Gateway
    const api = new apigateway.RestApi(this, 'productServiceApi', {
      restApiName: 'Product Service',
      description: 'This service serves product information.',
    });

    const integrationResponses = [{
      statusCode: '200',
      responseParameters: {
        'method.response.header.Access-Control-Allow-Origin': `'${FRONTEND_URL}'`,
        'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
        'method.response.header.Access-Control-Allow-Methods': "'GET,OPTIONS'",
      },
    }];

    const methodResponses = [{
      statusCode: '200',
      responseParameters: {
        'method.response.header.Access-Control-Allow-Origin': true,
        'method.response.header.Access-Control-Allow-Headers': true,
        'method.response.header.Access-Control-Allow-Methods': true,
      },
    }];

    // Products resource (/products)
    const products = api.root.addResource('products');

    const getAllIntegration = new apigateway.LambdaIntegration(getProductsListLambda, {
      proxy: false,
      integrationResponses,
    });

    products.addMethod('GET', getAllIntegration, {
      methodResponses,
    });

    products.addCorsPreflight({
      allowOrigins: [FRONTEND_URL],
      allowMethods: ['GET'],
      allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token'],
      allowCredentials: true,
    });

    // Products by id resource (/products/{productId})
    const product = products.addResource('{productId}');

    const getByIdIntegration = new apigateway.LambdaIntegration(getProductsByIdLambda, {
      requestTemplates: {
        "application/json": `{ "productId": "$input.params('productId')" }`
      },
      proxy: false,
      integrationResponses,
    });

    product.addMethod('GET', getByIdIntegration, {
      methodResponses,
    });

    product.addCorsPreflight({
      allowOrigins: [FRONTEND_URL],
      allowMethods: ['GET'],
      allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token'],
      allowCredentials: true,
    });
  }
}