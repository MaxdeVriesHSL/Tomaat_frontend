export interface Beer {
    id?: string;
    name: string;
    description: string;
    type: string;
    beerTypeId?: string;
    alcoholPercentage: number;
    price: number;
    stockQuantity: number;
    imageUrl?: string;
}
