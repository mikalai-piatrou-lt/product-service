import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { AvailableProduct } from './types';
import {HEADERS} from "./utils";

const client = new DynamoDBClient({ region: process.env.AWS_REGION });

const productsTable = process.env.PRODUCTS_TABLE_NAME;
const stockTable = process.env.STOCK_TABLE_NAME;

export async function handler(event: any) {
    try {
        const productId = event.pathParameters?.productId;

        //get product
        const productCommand = new GetItemCommand({
            TableName: productsTable,
            Key: { id: { S: productId } },
        });
        const productResult = await client.send(productCommand);

        if (!productResult.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ code: 404, message: 'Product not found' }),
                headers: HEADERS
            };
        }

        //get stock
        const stockCommand = new GetItemCommand({
            TableName: stockTable,
            Key: { product_id: { S: productId } },
        });
        //if there is no record in the stock table - okay, just count = 0
        const stockResult = await client.send(stockCommand);

        const product: AvailableProduct = {
            id: productResult.Item.id.S,
            title: productResult.Item.title.S,
            description: productResult.Item.description.S,
            price: parseInt(productResult.Item.price.N!, 10),
            count: stockResult.Item?.count.N || 0,
        };

        return {
            statusCode: 200,
            body: JSON.stringify(product),
            headers: HEADERS
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to fetch product' }),
            headers: HEADERS
        };
    }
}