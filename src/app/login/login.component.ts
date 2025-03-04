import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from "@angular/common";
import { Router } from '@angular/router';
import { DatabaseService } from "../services/database-service";
import { HttpErrorResponse } from '@angular/common/http';

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
      private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    console.log('LoginComponent initialized');
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.handleLogin(this.loginForm.value);
    }
  }

  handleLogin(credentials: {email: string, password: string}) {
    this.databaseService.loginUser(credentials).subscribe(
        (response) => {
          if (response.status === 200) {
            console.log('Login successful', response.body);
            if (response.body && response.body['jwt-token']) {
              localStorage.setItem('jwt-token', response.body['jwt-token']);

              if (response.body['temporary-password']) {
                console.warn('Temporary password used');
              }
            }
            this.router.navigate(['/home']);
          }
        },
        (error: HttpErrorResponse) => {
          console.error('Login error', error);

          // More detailed error handling
          if (error.status === 401) {
            this.loginError = 'Invalid email or password';
          } else if (error.status === 0) {
            this.loginError = 'Unable to connect to the server';
          } else {
            this.loginError = 'An unexpected error occurred';
          }
        }
    );
  }
}