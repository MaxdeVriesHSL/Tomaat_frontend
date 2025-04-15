import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {Beer} from '../models/beer.model';
import {Cart} from '../models/cart.model';
import {AuthService} from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private cart: Cart = {
        items: [],
        totalPrice: 0,
        totalItems: 0
    };

    private cartSubject = new BehaviorSubject<Cart>(this.cart);

    constructor(private authService: AuthService) {
        this.loadCartFromStorage();

        this.authService.currentUser$.subscribe(user => {
            if (!user) {
                this.cart = {
                    items: [],
                    totalPrice: 0,
                    totalItems: 0
                };
                this.cartSubject.next(this.cart);
            }
        });
    }

    getCart(): Observable<Cart> {
        return this.cartSubject.asObservable();
    }

    addToCart(beer: Beer, quantity: number = 1): boolean {
        const existingItem = this.cart.items.find(item => item.beer.id === beer.id);

        if (existingItem) {
            if (existingItem.quantity >= beer.stockQuantity) {
                return false;
            }

            const newQuantity = existingItem.quantity + quantity;
            existingItem.quantity = Math.min(newQuantity, beer.stockQuantity);
        } else {
            const effectiveQuantity = Math.min(quantity, beer.stockQuantity);
            if (effectiveQuantity <= 0) {
                return false;
            }
            this.cart.items.push({beer, quantity: effectiveQuantity});
        }

        this.updateCartTotals();
        this.saveCartToStorage();
        return true;
    }

    removeFromCart(beerId: string): void {
        this.cart.items = this.cart.items.filter(item => item.beer.id !== beerId);
        this.updateCartTotals();
        this.saveCartToStorage();
    }

    updateQuantity(beerId: string, quantity: number): void {
        const item = this.cart.items.find(item => item.beer.id === beerId);

        if (item) {
            item.quantity = Math.min(quantity, item.beer.stockQuantity);

            if (item.quantity <= 0) {
                this.removeFromCart(beerId);
            } else {
                this.updateCartTotals();
                this.saveCartToStorage();
            }
        }
    }

    clearCart(): void {
        this.cart.items = [];
        this.updateCartTotals();
        this.saveCartToStorage();
    }

    private updateCartTotals(): void {
        this.cart.totalItems = this.cart.items.reduce((total, item) => total + item.quantity, 0);
        this.cart.totalPrice = this.cart.items.reduce((total, item) => total + (item.beer.price * item.quantity), 0);
        this.cartSubject.next({...this.cart});
    }

    private saveCartToStorage(): void {
        localStorage.setItem('cart', JSON.stringify(this.cart.items));
    }

    private loadCartFromStorage(): void {
        const savedCart = localStorage.getItem('cart');

        if (savedCart) {
            try {
                this.cart.items = JSON.parse(savedCart);
                this.updateCartTotals();
            } catch (e) {
                this.clearCart();
            }
        }
    }
}
