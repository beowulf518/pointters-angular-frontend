import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthService } from './auth.service';

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

import { Paginated } from './../interfaces/paginated';

@Injectable()
export class ExploreLiveOffersService {
  constructor(private http: HttpClient,
    private authService: AuthService) {
  }

  getSuggestedOffers(page, currentBounds) {
    // let url = `${environment.apiUrl}services/live-offer-suggested?page=${page}&geoWithin=[[-74.856077,39.848447],[-72.856077,41.848447]]`;
    let url = `${environment.apiUrl}services/live-offer-suggested`;
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authService.token}`
      }),
    };
    // return this.http.get(url + `${page > 0 ? '?page=' + page : ''}`, httpOptions);
    return this.http.get(url + `${page > 0 ? '?page=' + page : ''}${currentBounds !== undefined ? '&geoWithin=['+ '[' + currentBounds[0] + ']' + ',' + '[' + currentBounds[1] + ']' + ']' : ''} `, httpOptions);
  }

  deleteRequest(id) {
    let url = `${environment.apiUrl}request/${id}`;
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authService.token}`
      }),
    };
    return  this.http.delete(url, httpOptions);
  }
  updateRequest(id,payload) {
    let url = `${environment.apiUrl}request/${id}`;
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authService.token}`
      }),
    };
    return this.http.put(url,payload, httpOptions);
  }
  getRequestData(id) {
    let url = `${environment.apiUrl}request/${id}`;
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authService.token}`
      }),
    };
    return this.http.get(url, httpOptions);
  }

}
