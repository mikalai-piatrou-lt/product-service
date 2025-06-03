import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { AvailableProduct } from './types';
import { HEADERS } from './utils';

const client = new DynamoDBClient({ region: process.env.AWS_REGION });

const productsTable = process.env.PRODUCTS_TABLE_NAME;
const stockTable = process.env.STOCK_TABLE_NAME;

export async function handler() {
    try {
        //get products
        const productsCommand = new ScanCommand({ TableName: productsTable });
        const productsResult = await client.send(productsCommand);

        //get stocks
        const stockCommand = new ScanCommand({ TableName: stockTable });
        const stocksResult = await client.send(stockCommand);

        //join products and stocks
        const products: AvailableProduct[] = productsResult.Items!.map(product => ({
            id: product.id.S,
            title: product.title.S,
            description: product.description.S,
            price: parseInt(product.price.N!, 10),
            count: stocksResult.Items!.find(stock => stock.product_id.S === product.id.S)?.count.N || 0,
        }));

        return {
            statusCode: 200,
            body: JSON.stringify(products),
            headers: HEADERS
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to fetch products' }),
            headers: HEADERS
        };
    }
}