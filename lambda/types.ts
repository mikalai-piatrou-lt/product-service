export type Product = {
    id: string;
    title: string;
    description: string;
    price: number;
}

export type Stock = {
    product_id: string,
    count: string | number;
};

export type AvailableProduct = Product & Pick<Stock, "count">;