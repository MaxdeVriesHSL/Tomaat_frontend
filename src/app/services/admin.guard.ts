import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth.service';
import { map, catchError, take } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class AdminGuard implements CanActivate {

    constructor(
        private router: Router,
        private authService: AuthService
    ) {}

    canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        if (!this.authService.isLoggedIn()) {
            this.router.navigate(['/login']);
            return false;
        }

        return this.authService.loadUserInfo().pipe(
            map(userInfo => {
                const isAdmin = userInfo?.role?.name === 'ADMIN';

                if (!isAdmin) {
                    this.router.navigate(['/home']);
                    return false;
                }

                return true;
            }),
            catchError(() => {
                this.router.navigate(['/home']);
                return of(false);
            }),
            take(1)
        );
    }
}
