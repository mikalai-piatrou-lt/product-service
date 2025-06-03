import { DynamoDBClient, PutItemCommand  } from '@aws-sdk/client-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { HEADERS } from './utils';

const client = new DynamoDBClient({ region: process.env.AWS_REGION });

const productsTable = process.env.PRODUCTS_TABLE_NAME;
const stockTable = process.env.STOCK_TABLE_NAME;

export async function handler(event: any) {
    try {
        const { title, description, price, count } = JSON.parse(event.body);
        const productId = uuidv4();

        const productItem = {
            id: { S: productId },
            title: { S: title },
            description: { S: description },
            price: { N: price.toString() },
        };

        const stockItem = {
            product_id: { S: productId },
            count: { N: count.toString() },
        };

        const productCommand = new PutItemCommand({
            TableName: productsTable,
            Item: productItem,
        });

        const stockCommand = new PutItemCommand({
            TableName: stockTable,
            Item: stockItem,
        });

        await client.send(productCommand);
        await client.send(stockCommand);

        return {
            statusCode: 200,
            body: JSON.stringify({ id: productId }),
            headers: HEADERS
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to create product', error }),
            headers: HEADERS
        };
    }
}