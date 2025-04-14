import { Beer } from './beer.model';

export interface CartItem {
    beer: Beer;
    quantity: number;
}

export interface Cart {
    items: CartItem[];
    totalPrice: number;
    totalItems: number;
}
