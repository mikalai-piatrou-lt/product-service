import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

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

    // Products resource (/products)
    const products = api.root.addResource('products');
    const getAllIntegration = new apigateway.LambdaIntegration(getProductsListLambda);
    products.addMethod('GET', getAllIntegration);

    // Adding CORS options
    products.addCorsPreflight({
      allowOrigins: ['https://d31cdo0fo49iqu.cloudfront.net'],
      allowMethods: ['GET'],
    });

    // Products by id resource (/products/{productId})
    const product = products.addResource('{productId}');
    const getByIdIntegration = new apigateway.LambdaIntegration(getProductsByIdLambda);
    product.addMethod('GET', getByIdIntegration);

    // Adding CORS options
    product.addCorsPreflight({
      allowOrigins: ['https://d31cdo0fo49iqu.cloudfront.net'],
      allowMethods: ['GET'],
    });
  }
}
