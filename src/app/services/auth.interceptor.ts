import {HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {inject} from '@angular/core';
import {Router} from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
    const router = inject(Router);
    const token = localStorage.getItem('jwt-token');

    if (token) {
        const authReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });

        return next(authReq).pipe(
            catchError((error) => {
                if (error instanceof HttpErrorResponse && error.status === 401) {
                    localStorage.removeItem('jwt-token');
                    router.navigate(['/login']);
                }
                return throwError(() => error);
            })
        );
    }

    return next(req);
};
