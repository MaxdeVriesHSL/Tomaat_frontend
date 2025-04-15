import {Component} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule} from "@angular/common";
import {Router} from '@angular/router';
import {DatabaseService} from "../services/database.service";

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
export class RegisterComponent {
    registerForm: FormGroup;
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

    onSubmit() {
        if (this.registerForm.valid) {
            this.handleRegistration(this.registerForm.value);
        }
    }

    handleRegistration(formData: any) {
        this.databaseService.registerUser(formData).subscribe({
            next: (response) => {
                if (response.status === 200 || response.status === 201 || response.status === 202) {
                    if (response.body && response.body['jwt-token']) {
                        localStorage.setItem('jwt-token', response.body['jwt-token']);
                    }
                    this.router.navigate(['/login']);
                }
            },
            error: (error) => {
                if (error.error && error.error.message) {
                    this.registrationError = error.error.message;
                } else {
                    this.registrationError = 'Registration failed. Please try again.';
                }
            }
        });
    }
}
