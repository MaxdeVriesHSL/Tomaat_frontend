import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface DecodedToken {
    sub?: string;
    id?: string;
    email?: string;
    role?: string;
    iss?: string;
    exp?: number;
    iat?: number;
    [key: string]: any;
}

export interface UserInfo {
    id: string;
    email: string;
    name: string;
    role: {
        name: string;
    };
    isAdmin?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private baseUrl = 'http://localhost:8080';
    private currentUserSubject = new BehaviorSubject<UserInfo | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    private isAdminValue = false;
    private userInfoLoaded = false;

    constructor(private http: HttpClient) {
        if (this.getToken()) {
            this.loadUserInfo().subscribe();
        }
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }

    getToken(): string | null {
        return localStorage.getItem('jwt-token');
    }

    logout(): void {
        localStorage.removeItem('jwt-token');
        this.currentUserSubject.next(null);
        this.isAdminValue = false;
        this.userInfoLoaded = false;

        localStorage.removeItem('cart');
    }

    isAdmin(): boolean {
        if (this.userInfoLoaded) {
            return this.isAdminValue;
        }

        const token = this.getToken();
        if (!token) return false;

        try {
            const decodedToken = this.decodeToken(token);

            if (decodedToken.exp) {
                const currentTime = Date.now() / 1000;
                if (decodedToken.exp < currentTime) {
                    this.logout();
                    return false;
                }
            }

            if (decodedToken.role === 'ADMIN') {
                this.isAdminValue = true;
                return true;
            }

            this.loadUserInfo().subscribe();
            return this.isAdminValue;
        } catch (e) {
            this.loadUserInfo().subscribe();
            return this.isAdminValue;
        }
    }

    loadUserInfo(): Observable<UserInfo | null> {
        const token = this.getToken();
        if (!token) {
            return of(null);
        }

        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });

        return this.http.get<UserInfo>(`${this.baseUrl}/auth/me`, { headers }).pipe(
            tap(userInfo => {
                this.isAdminValue = userInfo.role?.name === 'ADMIN';
                this.userInfoLoaded = true;
                this.currentUserSubject.next(userInfo);
            }),
            catchError(error => {
                if (error.status === 401) {
                    this.logout();
                }
                return of(null);
            })
        );
    }

    decodeToken(token: string): DecodedToken {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                return {};
            }

            const base64Url = parts[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

            try {
                const rawPayload = atob(base64);
                const jsonPayload = decodeURIComponent(
                    Array.from(rawPayload)
                        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                        .join('')
                );

                return JSON.parse(jsonPayload);
            } catch (e) {
                return {};
            }
        } catch (e) {
            return {};
        }
    }
}
