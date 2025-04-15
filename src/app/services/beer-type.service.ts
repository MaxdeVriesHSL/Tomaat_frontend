import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BeerType } from '../models/beer-type.model';

@Injectable({
    providedIn: 'root'
})
export class BeerTypeService {
    private baseUrl = 'http://localhost:8080';
    private endpoint = `${this.baseUrl}/beerType`;

    constructor(private http: HttpClient) {}

    public getAllBeerTypes(): Observable<BeerType[]> {
        return this.http.get<BeerType[]>(`${this.endpoint}/all`);
    }

    public getBeerTypeById(id: string): Observable<BeerType> {
        return this.http.get<BeerType>(`${this.endpoint}/${id}`);
    }

    public createBeerType(beerType: BeerType): Observable<HttpResponse<any>> {
        return this.http.post(`${this.endpoint}/new`, beerType, { observe: 'response' });
    }

    public updateBeerType(id: string, beerType: BeerType): Observable<HttpResponse<any>> {
        return this.http.put(`${this.endpoint}/${id}`, beerType, { observe: 'response' });
    }

    public deleteBeerType(id: string): Observable<HttpResponse<any>> {
        return this.http.delete(`${this.endpoint}/${id}`, { observe: 'response' });
    }
}
