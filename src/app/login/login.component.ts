import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule} from "@angular/common";
import {Router} from '@angular/router';
import {DatabaseService} from "../services/database.service";
import {AuthService} from "../services/auth.service";
import {HttpErrorResponse} from '@angular/common/http';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    standalone: true,
    imports: [
        ReactiveFormsModule,
        CommonModule
    ]
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    loginError: string = '';

    constructor(
        private fb: FormBuilder,
        private databaseService: DatabaseService,
        private authService: AuthService,
        private router: Router
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });
    }

    ngOnInit() {
        if (this.authService.isLoggedIn()) {
            this.redirectBasedOnRole();
        }
    }

    onSubmit() {
        if (this.loginForm.valid) {
            this.handleLogin(this.loginForm.value);
        }
    }

    handleLogin(credentials: { email: string, password: string }) {
        this.databaseService.loginUser(credentials).subscribe({
            next: (response: any) => {
                if (response.status === 200) {
                    if (response.body && response.body['jwt-token']) {
                        localStorage.setItem('jwt-token', response.body['jwt-token']);
                        this.redirectBasedOnRole();
                    }
                }
            },
            error: (error: HttpErrorResponse) => {
                if (error.status === 401) {
                    this.loginError = 'Invalid email or password';
                } else if (error.status === 0) {
                    this.loginError = 'Unable to connect to the server';
                } else {
                    this.loginError = 'An unexpected error occurred';
                }
            }
        });
    }

    redirectBasedOnRole() {
        this.authService.loadUserInfo().subscribe({
            next: userInfo => {
                if (userInfo?.role?.name === 'ADMIN') {
                    this.router.navigate(['/admin']);
                } else {
                    this.router.navigate(['/home']);
                }
            },
            error: () => {
                this.router.navigate(['/home']);
            }
        });
    }
}
