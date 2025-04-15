import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {DatabaseService} from '../services/database.service';
import {CartService} from '../services/cart.service';
import {AuthService} from '../services/auth.service';
import {BeerTypeService} from '../services/beer-type.service';
import {Beer} from '../models/beer.model';
import {BeerType} from '../models/beer-type.model';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        FormsModule
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
    allBeers: Beer[] = [];
    displayedBeers: Beer[] = [];
    loading: boolean = true;
    errorMessage: string = '';
    selectedType: string = '';
    sortOption: string = 'name';

    beerTypes: BeerType[] = [];
    loadingBeerTypes: boolean = true;

    constructor(
        private databaseService: DatabaseService,
        private cartService: CartService,
        private authService: AuthService,
        private beerTypeService: BeerTypeService
    ) {
    }

    ngOnInit(): void {
        this.loadBeers();
        this.loadBeerTypes();
    }

    loadBeers(): void {
        this.loading = true;
        this.errorMessage = '';

        this.databaseService.getAllBeers().subscribe({
            next: (beers) => {
                this.allBeers = beers;
                this.displayedBeers = [...this.allBeers];
                this.loading = false;
                this.applySorting();
            },
            error: (error) => {
                this.loading = false;
                this.errorMessage = 'Failed to load beers. Please try again later.';
            }
        });
    }

    loadBeerTypes(): void {
        this.loadingBeerTypes = true;

        this.beerTypeService.getAllBeerTypes().subscribe({
            next: (beerTypes) => {
                this.beerTypes = beerTypes;
                this.loadingBeerTypes = false;
            },
            error: (error) => {
                this.loadingBeerTypes = false;
                console.error('Failed to load beer types', error);
            }
        });
    }

    filterByType(type: string): void {
        this.selectedType = type;

        if (type === '') {
            this.displayedBeers = [...this.allBeers];
        } else {
            this.displayedBeers = this.allBeers.filter(beer => beer.type === type);
        }

        this.applySorting();
    }

    applySorting(): void {
        switch (this.sortOption) {
            case 'name':
                this.displayedBeers.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'nameDesc':
                this.displayedBeers.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'priceLow':
                this.displayedBeers.sort((a, b) => a.price - b.price);
                break;
            case 'priceHigh':
                this.displayedBeers.sort((a, b) => b.price - a.price);
                break;
            case 'alcoholLow':
                this.displayedBeers.sort((a, b) => a.alcoholPercentage - b.alcoholPercentage);
                break;
            case 'alcoholHigh':
                this.displayedBeers.sort((a, b) => b.alcoholPercentage - a.alcoholPercentage);
                break;
        }
    }

    resetFilters(): void {
        this.selectedType = '';
        this.sortOption = 'name';
        this.displayedBeers = [...this.allBeers];
        this.applySorting();
    }

    scrollToBeers(): void {
        document.getElementById('beerCollection')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }

    onImageError(event: any): void {
        event.target.src = 'assets/default-beer.jpg';
    }

    isLoggedIn(): boolean {
        return this.authService.isLoggedIn();
    }

    addToCart(beer: Beer): void {
        if (!this.authService.isLoggedIn()) {
            this.showNotification("Please log in to add items to your cart");
            return;
        }

        if (beer.stockQuantity <= 0) {
            return;
        }

        const added = this.cartService.addToCart(beer, 1);
        if (added) {
            this.showNotification(`${beer.name} added to cart`);
        }
    }

    showNotification(message: string): void {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.className = 'fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded shadow-lg z-50 animate-fade-in';

        const style = document.createElement('style');
        style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fade-in {
        animation: fadeIn 0.3s ease-out forwards;
      }
    `;
        document.head.appendChild(style);

        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}
