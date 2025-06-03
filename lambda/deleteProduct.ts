import { HEADERS } from './utils';
import { deleteProduct } from './utils/dbOperations';

export async function handler(event: any) {
    try {
        const productId = event.pathParameters?.productId;
        await deleteProduct(productId);

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