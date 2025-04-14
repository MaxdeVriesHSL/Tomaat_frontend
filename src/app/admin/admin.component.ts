import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {DatabaseService} from '../services/database.service';
import {Beer} from '../models/beer.model';
import {HttpErrorResponse} from '@angular/common/http';
import {AuthService} from "../services/auth.service";

@Component({
    selector: 'app-admin',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule
    ],
    templateUrl: './admin.component.html',
    styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
    allBeers: Beer[] = [];
    filteredBeers: Beer[] = [];
    loading: boolean = true;
    errorMessage: string = '';
    successMessage: string = '';
    searchTerm: string = '';
    viewMode: 'table' | 'grid' = 'table';
    showModal: boolean = false;
    showDeleteModal: boolean = false;
    isEditMode: boolean = false;
    submitting: boolean = false;
    beerForm: FormGroup;
    beerToDelete: Beer | null = null;
    tokenExists: boolean = false;
    isAdmin: boolean = false;
    selectedImagePreview: string | null = null;
    localImageFile: File | null = null;

    beerTypes: string[] = [
        'IPA',
        'Stout',
        'Tripel',
        'Quadrupel',
        'Belgian Ales',
        'Wheat',
        'Bocks',
        'Homebrew'
    ];

    constructor(
        private fb: FormBuilder,
        private databaseService: DatabaseService,
        private router: Router,
        private authService: AuthService
    ) {
        this.beerForm = this.createBeerForm();
        this.tokenExists = !!this.authService.getToken();
        this.isAdmin = this.authService.isAdmin();
    }

    ngOnInit(): void {
        this.checkAdminAccess();
        this.loadBeers();
    }

    checkAdminAccess(): void {
        if (!this.authService.getToken()) {
            this.router.navigate(['/login']);
        }
    }

    createBeerForm(): FormGroup {
        return this.fb.group({
            id: [null],
            name: ['', [Validators.required]],
            description: ['', [Validators.required]],
            type: ['', [Validators.required]],
            alcoholPercentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
            price: [0, [Validators.required, Validators.min(0)]],
            stockQuantity: [0, [Validators.required, Validators.min(0)]],
            imageUrl: [''],
        });
    }

    loadBeers(): void {
        this.loading = true;
        this.errorMessage = '';

        this.databaseService.getAllBeers().subscribe({
            next: (beers) => {
                this.allBeers = beers;
                this.filteredBeers = [...this.allBeers];
                this.loading = false;
            },
            error: (error) => {
                this.loading = false;
                this.errorMessage = 'Failed to load beers. Please try again later.';
            }
        });
    }

    filterBeers(): void {
        if (!this.searchTerm.trim()) {
            this.filteredBeers = [...this.allBeers];
            return;
        }

        const search = this.searchTerm.toLowerCase().trim();
        this.filteredBeers = this.allBeers.filter(beer =>
            beer.name.toLowerCase().includes(search) ||
            beer.type.toLowerCase().includes(search) ||
            beer.description.toLowerCase().includes(search)
        );
    }

    showAddBeerForm(): void {
        this.isEditMode = false;
        this.beerForm.reset({
            alcoholPercentage: 0,
            price: 0,
            stockQuantity: 0
        });
        this.showModal = true;
    }

    editBeer(beer: Beer): void {
        this.isEditMode = true;
        this.beerForm.patchValue({
            id: beer.id,
            name: beer.name,
            description: beer.description,
            type: beer.type,
            alcoholPercentage: beer.alcoholPercentage,
            price: beer.price,
            stockQuantity: beer.stockQuantity,
            imageUrl: beer.imageUrl
        });

        if (beer.imageUrl) {
            this.selectedImagePreview = beer.imageUrl;
        } else {
            this.selectedImagePreview = null;
        }

        this.showModal = true;
    }

    closeModal(): void {
        this.showModal = false;
        this.selectedImagePreview = null;
        this.localImageFile = null;
    }

    saveBeer(): void {
        if (this.beerForm.invalid) {
            return;
        }

        this.submitting = true;
        const beerData: Beer = this.beerForm.value;

        if (this.isEditMode) {
            this.databaseService.updateBeer(beerData.id!, beerData).subscribe({
                next: () => this.handleSaveSuccess(`Beer "${beerData.name}" has been updated`),
                error: (error) => this.handleSaveError(error)
            });
        } else {
            this.databaseService.createBeer(beerData).subscribe({
                next: () => this.handleSaveSuccess(`Beer "${beerData.name}" has been added`),
                error: (error) => this.handleSaveError(error)
            });
        }
    }

    handleSaveSuccess(message: string): void {
        this.submitting = false;
        this.showModal = false;
        this.successMessage = message;
        this.loadBeers();

        setTimeout(() => this.successMessage = '', 3000);
    }

    handleSaveError(error: any): void {
        this.submitting = false;

        if (error instanceof HttpErrorResponse) {
            if (error.status === 401) {
                this.errorMessage = 'You are not authorized to perform this action';
            } else if (error.status === 0) {
                this.errorMessage = 'Unable to connect to the server';
            } else {
                this.errorMessage = `Error: ${error.message}`;
            }
        } else {
            this.errorMessage = 'An unexpected error occurred';
        }
    }

    confirmDelete(beer: Beer): void {
        this.beerToDelete = beer;
        this.showDeleteModal = true;
    }

    cancelDelete(): void {
        this.beerToDelete = null;
        this.showDeleteModal = false;
    }

    deleteBeer(): void {
        if (!this.beerToDelete) {
            return;
        }

        this.databaseService.deleteBeer(this.beerToDelete.id!).subscribe({
            next: () => {
                this.successMessage = `Beer "${this.beerToDelete!.name}" has been deleted`;
                this.showDeleteModal = false;
                this.beerToDelete = null;
                this.loadBeers();
                setTimeout(() => this.successMessage = '', 3000);
            },
            error: (error) => {
                this.showDeleteModal = false;
                if (error instanceof HttpErrorResponse) {
                    if (error.status === 401) {
                        this.errorMessage = 'You are not authorized to delete this beer';
                    } else if (error.status === 0) {
                        this.errorMessage = 'Unable to connect to the server';
                    } else {
                        this.errorMessage = `Error: ${error.message}`;
                    }
                } else {
                    this.errorMessage = 'An unexpected error occurred while deleting the beer';
                }
            }
        });
    }

    onImageError(event: any): void {
        event.target.src = '/assets/default-beer.jpg';
    }

    onImageSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            this.localImageFile = file;
            const reader = new FileReader();
            reader.onload = () => {
                this.selectedImagePreview = reader.result as string;

                if (this.selectedImagePreview) {
                    this.beerForm.patchValue({
                        imageUrl: this.selectedImagePreview
                    });
                }
            };
            reader.readAsDataURL(file);
        }
    }
}
