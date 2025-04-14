import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from "rxjs";
import { User } from "../models/user.model";
import { Beer } from "../models/beer.model";

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private baseUrl = 'http://localhost:8080';
  private endpoints = {
    register: `${this.baseUrl}/auth/register`,
    login: `${this.baseUrl}/auth/login`,
    users: `${this.baseUrl}/user`,
    beers: `${this.baseUrl}/beer`
  };

  constructor(private http: HttpClient) {}

  public registerUser(postData: any): Observable<HttpResponse<any>> {
    return this.http.post(this.endpoints.register, postData, { observe: 'response' });
  }

  public loginUser(credentials: {email: string, password: string}): Observable<HttpResponse<any>> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(this.endpoints.login, credentials, {
      headers,
      observe: 'response'
    });
  }

  // Beer
  public getAllBeers(): Observable<Beer[]> {
    return this.http.get<Beer[]>(`${this.endpoints.beers}/getBeers`);
  }

  public createBeer(beer: Beer): Observable<HttpResponse<any>> {
    return this.http.post(`${this.endpoints.beers}/newBeer`, beer, { observe: 'response' });
  }

  public updateBeer(id: string, beer: Beer): Observable<HttpResponse<any>> {
    return this.http.put(`${this.endpoints.beers}/${id}`, beer, { observe: 'response' });
  }

  public deleteBeer(id: string): Observable<HttpResponse<any>> {
    return this.http.delete(`${this.endpoints.beers}/${id}`, { observe: 'response' });
  }
}
