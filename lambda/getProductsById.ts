import { products } from './mockData';

export async function handler(event: any) {
    const productId: string = event.productId;
    const product = products.find(product => product.id === productId);
    if (!product) {
        return {
            code: 404,
            message: 'Product not found',
        };
    }
    return product;
}