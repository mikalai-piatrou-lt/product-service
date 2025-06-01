import { HEADERS } from './utils';
import { getProducts } from './utils/dbOperations';

export async function handler() {
    try {
        const products = await getProducts();

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