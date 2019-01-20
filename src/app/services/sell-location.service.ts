import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './../../environments/environment';

import {
  Observable
} from 'rxjs/Observable';
import {
  of
} from 'rxjs/observable/of';
import {
  catchError,
  map,
  tap
} from 'rxjs/operators';

import { AuthService } from './auth.service';

@Injectable()
export class SellLocationService {

  private apiUrl = `${environment.apiUrl}`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }
  getStoreLocation() {
    let url = this.apiUrl + 'stores';
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authService.token}`
      })
    };
    return this.http.get(url, httpOptions);
  }
  addStoreLocation(data) {
    let url = this.apiUrl + 'store';
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authService.token}`
      })
    };
    return this.http.post(url, data, httpOptions);
  }
  updateStoreLocation(id,data) {
    let url = this.apiUrl + 'store/'+id;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authService.token}`
      })
    };
    return this.http.put(url, data, httpOptions);
  }
  deleteStoreLocation(id) {
    let url = this.apiUrl + 'store/'+id;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authService.token}`
      })
    };
    return this.http.delete(url, httpOptions);
  }
}
