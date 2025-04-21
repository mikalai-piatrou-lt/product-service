import { products } from './mockData';

export async function handler(event: any) {
    const productId: string = event.pathParameters?.productId;
    const product = products.find(product => product.id === productId);
    if (!product) {
        return {
            statusCode: 404,
            body: JSON.stringify({ message: 'Product not found' }),
        };
    }
    return {
        statusCode: 200,
        body: JSON.stringify(product),
    };
}