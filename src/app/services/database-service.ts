import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse, HttpHeaders} from '@angular/common/http';
import {Observable} from "rxjs";
import {User} from "../models/user.model";

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  baseUrl = 'http://localhost:8080'
  registerUrl = `${this.baseUrl}/auth/register`;
  loginUrl = `${this.baseUrl}/auth/login`;
  usersUrl = `${this.baseUrl}/user`;

  constructor(private http: HttpClient) {}

  public registerUser(postData: any): Observable<HttpResponse<any>> {
    return this.http.post(this.registerUrl, postData, { observe: 'response' });
  }

  public loginUser(credentials: {email: string, password: string}): Observable<HttpResponse<any>> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(this.loginUrl, credentials, {
      headers: headers,
      observe: 'response'
    });
  }

  public getAllUsers(): Observable<User[]> {
    const token = localStorage.getItem('jwt-token');

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<User[]>(this.usersUrl, { headers });
  }
}
