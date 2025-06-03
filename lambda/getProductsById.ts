import { HEADERS } from './utils';
import { getProduct } from './utils/dbOperations';

export async function handler(event: any) {
    try {
        const productId = event.pathParameters?.productId;
        const product = await getProduct(productId);

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