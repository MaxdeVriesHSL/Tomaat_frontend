import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  isLoggedIn: boolean = false;
  isAdmin: boolean = false;
  showAccountMenu: boolean = false;
  cartItemCount: number = 0;
  userName: string = '';

  private cartSubscription: Subscription | null = null;
  private userSubscription: Subscription | null = null;

  constructor(
      private router: Router,
      private authService: AuthService,
      private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.checkLoginStatus();

    this.cartSubscription = this.cartService.getCart().subscribe(cart => {
      this.cartItemCount = cart.totalItems;
    });

    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.isLoggedIn = true;
        this.isAdmin = user.role?.name === 'ADMIN';
        this.userName = user.name || 'User';
      } else {
        this.isLoggedIn = false;
        this.isAdmin = false;
        this.userName = '';
      }
    });
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  checkLoginStatus(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.authService.loadUserInfo().subscribe();
    }
  }

  toggleAccountMenu(): void {
    this.showAccountMenu = !this.showAccountMenu;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.account-menu-container')) {
      this.showAccountMenu = false;
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
