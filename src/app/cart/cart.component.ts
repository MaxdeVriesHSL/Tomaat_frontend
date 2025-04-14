import {Component, OnInit, OnDestroy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {CartService} from '../services/cart.service';
import {Cart} from '../models/cart.model';
import {Subscription} from 'rxjs';

@Component({
    selector: 'app-cart',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        FormsModule
    ],
    templateUrl: './cart.component.html',
    styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit, OnDestroy {
    cart: Cart = {
        items: [],
        totalPrice: 0,
        totalItems: 0
    };

    private cartSubscription: Subscription | null = null;

    constructor(private cartService: CartService) {
    }

    ngOnInit(): void {
        this.cartSubscription = this.cartService.getCart().subscribe(cart => {
            this.cart = cart;
        });
    }

    ngOnDestroy(): void {
        if (this.cartSubscription) {
            this.cartSubscription.unsubscribe();
        }
    }

    incrementQuantity(beerId: string, maxStock: number): void {
        const item = this.cart.items.find(item => item.beer.id === beerId);
        if (item && item.quantity < maxStock) {
            this.cartService.updateQuantity(beerId, item.quantity + 1);
        }
    }

    decrementQuantity(beerId: string): void {
        const item = this.cart.items.find(item => item.beer.id === beerId);
        if (item && item.quantity > 1) {
            this.cartService.updateQuantity(beerId, item.quantity - 1);
        }
    }

    updateQuantity(beerId: string, event: any): void {
        const newQuantity = parseInt(event.target.value, 10);
        if (!isNaN(newQuantity) && newQuantity > 0) {
            this.cartService.updateQuantity(beerId, newQuantity);
        }
    }

    removeItem(beerId: string): void {
        this.cartService.removeFromCart(beerId);
    }

    clearCart(): void {
        if (confirm('Are you sure you want to clear your cart?')) {
            this.cartService.clearCart();
        }
    }

    checkout(): void {
        alert('This would proceed to checkout in a real application.');
    }

    onImageError(event: any): void {
        event.target.src = '/assets/default-beer.jpg';
    }
}
