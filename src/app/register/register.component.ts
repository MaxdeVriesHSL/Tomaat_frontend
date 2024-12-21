import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule} from "@angular/common";
import {DatabaseService} from "../services/database-service";
import {Customer} from "../models/customer.model";

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
    this.getCustomers();
  }

  registerForm: FormGroup;
  customers: Customer[] = [];

  constructor(private databaseService: DatabaseService, private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', [Validators.required, Validators.pattern("^[0-9]{10}$")]]
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      console.log('Form submitted:', this.registerForm.value);
      // Here you can call your method to handle the form submission
      this.handleRegistration(this.registerForm.value);
    }
  }

  handleRegistration(formData: FormGroup) {
    // Implement your registration logic here
    this.databaseService.registerUser(formData);
    console.log('Registration data:', formData);
  }

  getCustomers() {
    this.databaseService.getAllCustomers().subscribe(
      (customers: Customer[]) => {
        this.customers = customers;
        // Do something with the list of customers
      },
      (error) => {
        console.error('Error retrieving customers:', error);
      }
    );
  }
}
