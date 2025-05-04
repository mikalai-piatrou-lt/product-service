import { DynamoDBClient, DeleteItemCommand  } from '@aws-sdk/client-dynamodb';
import { HEADERS } from './utils';

const client = new DynamoDBClient({ region: process.env.AWS_REGION });

const productsTable = process.env.PRODUCTS_TABLE_NAME;
const stockTable = process.env.STOCK_TABLE_NAME;

export async function handler(event: any) {
    try {
        const productId = event.pathParameters?.productId;

        //delete product from products table
        const deleteProductCommand = new DeleteItemCommand({
            TableName: productsTable,
            Key: { id: { S: productId } },
        });
        await client.send(deleteProductCommand);

        //delete stock from stock table by product_id
        const deleteStockCommand = new DeleteItemCommand({
            TableName: stockTable,
            Key: { product_id: { S: productId } },
        });
        await client.send(deleteStockCommand);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Product deleted successfully' }),
            headers: HEADERS
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to delete product', error }),
            headers: HEADERS
        };
    }
}