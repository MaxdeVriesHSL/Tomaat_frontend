import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule} from "@angular/common";
import {Router} from '@angular/router';
import {DatabaseService} from "../services/database-service";
import {User} from "../models/user.model";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
  ]
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  users: User[] = [];
  registrationError: string = '';

  constructor(
      private databaseService: DatabaseService,
      private fb: FormBuilder,
      private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
      ]]
    });
  }

  ngOnInit() {
    console.log('RegisterComponent initialized');
    this.getUsers();
  }

  onSubmit() {
    if (this.registerForm.valid) {
      console.log('Form submitted:', this.registerForm.value);
      this.handleRegistration(this.registerForm.value);
    }
  }

  handleRegistration(formData: any) {
    this.databaseService.registerUser(formData).subscribe(
        (response) => {
          if (response.status === 200 || response.status === 201 || response.status === 202 ) {
            console.log('Registration successful', response.body);
            if (response.body && response.body['jwt-token']) {
              localStorage.setItem('jwt-token', response.body['jwt-token']);
            }
            this.router.navigate(['/login']);
          }
        },
        (error) => {
          console.error('Registration error', error);
          if (error.error && error.error.message) {
            this.registrationError = error.error.message;
          } else {
            this.registrationError = 'Registration failed. Please try again.';
          }
        }
    );
  }

  getUsers() {
    this.databaseService.getAllUsers().subscribe(
        (users: User[]) => {
          this.users = users;
        },
        (error) => {
          console.error('Error retrieving users:', error);
        }
    );
  }
}