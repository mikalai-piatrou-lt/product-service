import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { CORS_OPTIONS } from '../lambda/utils';

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //import existing table for products
    const productsTable = dynamodb.Table.fromTableName(this, 'ProductsTable', 'products');

    //import existing table for stocks
    const stockTable = dynamodb.Table.fromTableName(this, 'StockTable', 'stock');

    // Lambda for getProductsList
    const getProductsListLambda = new lambda.Function(this, 'getProductsListHandler', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'getProductsList.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        PRODUCTS_TABLE_NAME: productsTable.tableName,
        STOCK_TABLE_NAME: stockTable.tableName,
      },
    });

    //grant read access to getProductsListLambda
    productsTable.grantReadData(getProductsListLambda);
    stockTable.grantReadData(getProductsListLambda);

    // Lambda for getProductsById
    const getProductsByIdLambda = new lambda.Function(this, 'getProductsByIdHandler', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'getProductsById.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        PRODUCTS_TABLE_NAME: productsTable.tableName,
        STOCK_TABLE_NAME: stockTable.tableName,
      },
    });

    //grant read access to getProductsByIdLambda
    productsTable.grantReadData(getProductsByIdLambda);
    stockTable.grantReadData(getProductsByIdLambda);

    // Lambda function for createProduct
    const createProductLambda = new lambda.Function(this, 'createProductHandler', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'createProduct.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        PRODUCTS_TABLE_NAME: productsTable.tableName,
        STOCK_TABLE_NAME: stockTable.tableName,
      },
    });

    //grant write access to createProductLambda
    productsTable.grantWriteData(createProductLambda);
    stockTable.grantWriteData(createProductLambda);

    // Lambda function for createProduct
    const deleteProductLambda = new lambda.Function(this, 'deleteProductHandler', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'deleteProduct.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        PRODUCTS_TABLE_NAME: productsTable.tableName,
        STOCK_TABLE_NAME: stockTable.tableName,
      },
    });

    //grant write access to createProductLambda
    productsTable.grantWriteData(deleteProductLambda);
    stockTable.grantWriteData(deleteProductLambda);

    // API Gateway
    const api = new apigateway.RestApi(this, 'productServiceApi', {
      restApiName: 'Product Service',
      description: 'This service serves product information.',
    });

    const products = api.root.addResource('products');
    products.addCorsPreflight(CORS_OPTIONS);
    const getAllIntegration = new apigateway.LambdaIntegration(getProductsListLambda);
    products.addMethod('GET', getAllIntegration);

    const productsById = products.addResource('{productId}');
    productsById.addCorsPreflight(CORS_OPTIONS);

    const getByIdIntegration = new apigateway.LambdaIntegration(getProductsByIdLambda);
    const deleteProductIntegration = new apigateway.LambdaIntegration(deleteProductLambda);
    productsById.addMethod('GET', getByIdIntegration);
    productsById.addMethod('DELETE', deleteProductIntegration);

    const product = api.root.addResource('product');
    product.addCorsPreflight(CORS_OPTIONS);
    const createProductIntegration = new apigateway.LambdaIntegration(createProductLambda);
    product.addMethod('PUT', createProductIntegration);
  }
}