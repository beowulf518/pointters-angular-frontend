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
export class BackgroundCheckService {

  private apiUrl = `${environment.apiUrl}`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }


  postBackgroundCheck(data) {
    let url = this.apiUrl + 'background-check';

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authService.token}`
      })
    };

    return this.http.post(url,data, httpOptions);
  }
  deleteBackgroundCheck(id) {
    let url = this.apiUrl + `background-check/${id}`;

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authService.token}`
      })
    };

    return this.http.delete(url, httpOptions);
  }
  updateBackgroundCheck(id,data) {
    let url = this.apiUrl +  `background-check/${id}`;

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authService.token}`
      })
    };

    return this.http.put(url,data, httpOptions);
  }
  getBackgroundCheck(id) {
    let url = this.apiUrl +`background-check/${id}`;

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authService.token}`
      })
    };

    return this.http.get(url, httpOptions);
  }
}
