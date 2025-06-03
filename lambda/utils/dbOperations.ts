import { DynamoDBClient, PutItemCommand, DeleteItemCommand, ScanCommand, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { AvailableProduct } from '../types';

const client = new DynamoDBClient({ region: process.env.AWS_REGION });

const productsTable = process.env.PRODUCTS_TABLE_NAME;
const stockTable = process.env.STOCK_TABLE_NAME;

export const createProduct = async (product: AvailableProduct) => {
    const productItem = {
        id: { S: product.id },
        title: { S: product.title },
        description: { S: product.description },
        price: { N: product.price.toString() },
    };

    const stockItem = {
        product_id: { S: product.id },
        count: { N: product.count.toString() },
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
}

export const deleteProduct = async (productId: string) => {
    //delete product from products table
    const deleteProductCommand = new DeleteItemCommand({
        TableName: productsTable,
        Key: { id: { S: productId } },
    });

    //delete stock from stock table by product_id
    const deleteStockCommand = new DeleteItemCommand({
        TableName: stockTable,
        Key: { product_id: { S: productId } },
    });

    await client.send(deleteProductCommand);
    await client.send(deleteStockCommand);
}

export const getProducts = async (): Promise<AvailableProduct[]> => {
    //get products
    const productsCommand = new ScanCommand({ TableName: productsTable });
    const productsResult = await client.send(productsCommand);

    //get stocks
    const stockCommand = new ScanCommand({ TableName: stockTable });
    const stocksResult = await client.send(stockCommand);

    const products: AvailableProduct[] = productsResult.Items!.map(product => ({
        id: product.id.S!,
        title: product.title.S!,
        description: product.description.S!,
        price: parseInt(product.price.N!, 10),
        count: stocksResult.Items!.find(stock => stock.product_id.S === product.id.S)?.count.N || 0,
    }));

    return products;
}

export const getProduct = async (id: string): Promise<AvailableProduct> => {
    //get product
    const productCommand = new GetItemCommand({
        TableName: productsTable,
        Key: { id: { S: id } },
    });
    const productResult = await client.send(productCommand);

    if (!productResult || !productResult.Item) {
        throw new Error('Product not found');
    } else {
        //get stock
        const stockCommand = new GetItemCommand({
            TableName: stockTable,
            Key: { product_id: { S: id } },
        });
        //if there is no record in the stock table - okay, just count = 0
        const stockResult = await client.send(stockCommand);

        const product: AvailableProduct = {
            id: productResult.Item.id.S!,
            title: productResult.Item.title.S!,
            description: productResult.Item.description.S!,
            price: parseInt(productResult.Item.price.N!, 10),
            count: stockResult.Item?.count.N || 0,
        };

        return product;
    }
}