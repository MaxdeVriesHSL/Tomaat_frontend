import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule} from "@angular/common";
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
  ],
  providers: [DatabaseService]
})
export class RegisterComponent implements OnInit {
  ngOnInit() {
    console.log('RegisterComponent initialized');
    this.getUsers();
  }

  registerForm: FormGroup;
  users: User[] = [];

  constructor(private databaseService: DatabaseService, private fb: FormBuilder) {
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
      console.log('Form submitted:', this.registerForm.value);
      this.handleRegistration(this.registerForm.value);
    }
  }

  handleRegistration(formData: FormGroup) {
    this.databaseService.registerUser(formData);
    console.log('Registration data:', formData);
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
