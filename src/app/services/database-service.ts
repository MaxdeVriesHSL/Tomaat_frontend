import {Injectable} from '@angular/core';
import {HttpClient, HttpStatusCode} from '@angular/common/http';
// @ts-ignore
import {JsonArray, JsonObject} from '@angular/compiler-cli/ngcc/src/utils';
import {Observable} from "rxjs";
import {Customer} from "../models/customer.model";

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  baseUrl = 'http://localhost:8080'
  registerUrl = `${this.baseUrl}/customer`;


  constructor(private http: HttpClient) {
  }
    public registerUser(postData: JsonObject) {
      this.http
        .post(this.registerUrl, postData, {observe: 'response'})
        .subscribe(resp => {
          console.log(resp.body);
        });
    }

  public getAllCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.baseUrl}/customer`);
  }
}
