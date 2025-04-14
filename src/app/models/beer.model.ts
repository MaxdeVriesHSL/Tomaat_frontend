export interface Beer {
    id?: string;
    uuid?: string;
    name: string;
    description: string;
    type: string;
    alcoholPercentage: number;
    price: number;
    stockQuantity: number;
    imageUrl: string;
}
