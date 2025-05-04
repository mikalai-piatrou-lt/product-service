export type Product = {
    id: string | undefined;
    title: string | undefined;
    description: string | undefined;
    price: number;
}

export type Stock = {
    product_id: string | undefined,
    count: string | number;
};

export type AvailableProduct = Product & Pick<Stock, "count">;