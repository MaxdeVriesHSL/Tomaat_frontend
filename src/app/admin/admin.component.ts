import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {DatabaseService} from '../services/database.service';
import {Beer} from '../models/beer.model';
import {HttpErrorResponse} from '@angular/common/http';
import {AuthService} from "../services/auth.service";
import {BeerType} from "../models/beer-type.model";
import {BeerTypeService} from "../services/beer-type.service";

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
    beerTypes: BeerType[] = [];
    showBeerTypeModal: boolean = false;
    beerTypeForm: FormGroup;
    isBeerTypeEditMode: boolean = false;
    beerTypeToDelete: BeerType | null = null;
    showBeerTypeDeleteModal: boolean = false;

    constructor(
        private fb: FormBuilder,
        private databaseService: DatabaseService,
        private router: Router,
        private authService: AuthService,
        private beerTypeService: BeerTypeService
    ) {
        this.beerForm = this.createBeerForm();
        this.beerTypeForm = this.createBeerTypeForm();
        this.tokenExists = !!this.authService.getToken();
        this.isAdmin = this.authService.isAdmin();
    }

    ngOnInit(): void {
        this.checkAdminAccess();
        this.loadBeers();
        this.loadBeerTypes();
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
            beerTypeId: ['', [Validators.required]],
            alcoholPercentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
            price: [0, [Validators.required, Validators.min(0)]],
            stockQuantity: [0, [Validators.required, Validators.min(0)]],
            imageUrl: [''],
        });
    }

    createBeerTypeForm(): FormGroup {
        return this.fb.group({
            id: [null],
            name: ['', [Validators.required]]
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

    loadBeerTypes(): void {
        this.beerTypeService.getAllBeerTypes().subscribe({
            next: (beerTypes) => {
                this.beerTypes = beerTypes;
            },
            error: (error) => {
                this.errorMessage = 'Failed to load beer types. Please try again later.';
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
            beerTypeId: beer.beerTypeId || this.getBeerTypeIdByName(beer.type),
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

    getBeerTypeIdByName(typeName: string): string | null {
        const beerType = this.beerTypes.find(bt => bt.name === typeName);
        return beerType ? beerType.id! : null;
    }

    getBeerTypeName(typeId: string): string {
        const beerType = this.beerTypes.find(bt => bt.id === typeId);
        return beerType ? beerType.name : '';
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

        const selectedType = this.beerTypes.find(type => type.id === beerData.beerTypeId);
        if (selectedType) {
            beerData.type = selectedType.name;
        }

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

    // Beer type
    showAddBeerTypeForm(): void {
        this.isBeerTypeEditMode = false;
        this.beerTypeForm.reset();
        this.showBeerTypeModal = true;
    }

    editBeerType(beerType: BeerType): void {
        this.isBeerTypeEditMode = true;
        this.beerTypeForm.patchValue({
            id: beerType.id,
            name: beerType.name
        });
        this.showBeerTypeModal = true;
    }

    closeBeerTypeModal(): void {
        this.showBeerTypeModal = false;
    }

    saveBeerType(): void {
        if (this.beerTypeForm.invalid) {
            return;
        }

        this.submitting = true;
        const beerTypeData: BeerType = this.beerTypeForm.value;

        if (this.isBeerTypeEditMode) {
            this.beerTypeService.updateBeerType(beerTypeData.id!, beerTypeData).subscribe({
                next: () => this.handleBeerTypeSaveSuccess(`Beer type "${beerTypeData.name}" has been updated`),
                error: (error) => this.handleBeerTypeSaveError(error)
            });
        } else {
            this.beerTypeService.createBeerType(beerTypeData).subscribe({
                next: () => this.handleBeerTypeSaveSuccess(`Beer type "${beerTypeData.name}" has been added`),
                error: (error) => this.handleBeerTypeSaveError(error)
            });
        }
    }

    handleBeerTypeSaveSuccess(message: string): void {
        this.submitting = false;
        this.showBeerTypeModal = false;
        this.successMessage = message;
        this.loadBeerTypes();

        setTimeout(() => this.successMessage = '', 3000);
    }

    handleBeerTypeSaveError(error: any): void {
        this.submitting = false;

        if (error instanceof HttpErrorResponse) {
            if (error.status === 401) {
                this.errorMessage = 'You are not authorized to perform this action';
            } else if (error.status === 0) {
                this.errorMessage = 'Unable to connect to the server';
            } else if (error.status === 409) {
                this.errorMessage = 'A beer type with this name already exists';
            } else {
                this.errorMessage = `Error: ${error.message}`;
            }
        } else {
            this.errorMessage = 'An unexpected error occurred';
        }
    }

    confirmDeleteBeerType(beerType: BeerType): void {
        this.beerTypeToDelete = beerType;
        this.showBeerTypeDeleteModal = true;
    }

    cancelDeleteBeerType(): void {
        this.beerTypeToDelete = null;
        this.showBeerTypeDeleteModal = false;
    }

    deleteBeerType(): void {
        if (!this.beerTypeToDelete) {
            return;
        }

        this.beerTypeService.deleteBeerType(this.beerTypeToDelete.id!).subscribe({
            next: () => {
                this.successMessage = `Beer type "${this.beerTypeToDelete!.name}" has been deleted`;
                this.showBeerTypeDeleteModal = false;
                this.beerTypeToDelete = null;
                this.loadBeerTypes();
                setTimeout(() => this.successMessage = '', 3000);
            },
            error: (error) => {
                this.showBeerTypeDeleteModal = false;
                if (error instanceof HttpErrorResponse) {
                    if (error.status === 401) {
                        this.errorMessage = 'You are not authorized to delete this beer type';
                    } else if (error.status === 0) {
                        this.errorMessage = 'Unable to connect to the server';
                    } else {
                        this.errorMessage = `Error: ${error.message}`;
                    }
                } else {
                    this.errorMessage = 'An unexpected error occurred while deleting the beer type';
                }
            }
        });
    }
}
