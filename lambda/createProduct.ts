import { v4 as uuidv4 } from 'uuid';
import { HEADERS } from './utils';
import { createProduct } from './utils/dbOperations';
import { AvailableProduct } from './types';

export async function handler(event: any) {
    try {
        const { title, description, price, count } = JSON.parse(event.body);
        const productId = uuidv4();

        const product: AvailableProduct = {
            id: productId,
            title,
            description,
            price,
            count,
        };
        await createProduct(product);

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