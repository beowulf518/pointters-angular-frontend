import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable()
export class RequestService {
  private apiUrl = `${environment.apiUrl}request`;

  constructor(private http: HttpClient,
    private authService: AuthService) {
  }



  /**
   * return a request by it id
   *
   * @param {string} id uniquer request identifier
   * @returns request
   * @memberof RequestService
   */
  get(id: string) {
    const url = this.apiUrl;

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authService.token}`
      }),
    };

    return this.http.get(url + `/${id}`, httpOptions);
  }


  getRequests(params) {
    const url = this.apiUrl;

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authService.token}`
      }),

      params: new HttpParams({
        fromObject: params,
      }),
    };

    return this.http.get(url + 's', httpOptions);
  }

  createRequest(data: object) {
    const url = this.apiUrl;

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authService.token}`
      }),
    };

    return this.http.post(url, data, httpOptions);
  }

  updateRequest(data: object, id: string) {
    const url = this.apiUrl;

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authService.token}`
      }),
    };

    return this.http.put(url + `/${id}`, data, httpOptions);
  }

  deleteRequest(id: string) {
    const url = this.apiUrl;

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authService.token}`
      }),
    };

    return this.http.delete(url + `/${id}`, httpOptions);
  }

  getRequestOffers(id, currentBounds) {
    let url = this.apiUrl;
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authService.token}`
      }),
    };
    // return this.http.get(url + `/${id}/offers`, httpOptions);
    return this.http.get(url + `/${id}/offers` + `${currentBounds !== undefined ? '&geoWithin=[' + '[' + currentBounds[0] + ']' + ',' + '[' + currentBounds[1] + ']' + ']' : ''}`, httpOptions);

  }

  getRequestOffersPrice(id, currentBounds) {
    let url = this.apiUrl;
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authService.token}`
      }),
    };
    return this.http.get(url + `/${id}/offers?filter=price`, httpOptions);
    // return this.http.get(url + `/${id}/offers` + `${currentBounds !== undefined ? '&geoWithin=[' + '[' + currentBounds[0] + ']' + ',' + '[' + currentBounds[1] + ']' + ']' : ''}`, httpOptions);

  }

  getRequestOffersDistance(id, currentBounds) {
    let url = this.apiUrl;
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authService.token}`
      }),
    };
    return this.http.get(url + `/${id}/offers?filter=distance`, httpOptions);
    // return this.http.get(url + `/${id}/offers` + `${currentBounds !== undefined ? '&geoWithin=[' + '[' + currentBounds[0] + ']' + ',' + '[' + currentBounds[1] + ']' + ']' : ''}`, httpOptions);

  }

  getRequestOffersNew(id, currentBounds) {
    let url = this.apiUrl;
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authService.token}`
      }),
    };
    return this.http.get(url + `/${id}/offers?filter=new`, httpOptions);
    // return this.http.get(url + `/${id}/offers` + `${currentBounds !== undefined ? '&geoWithin=[' + '[' + currentBounds[0] + ']' + ',' + '[' + currentBounds[1] + ']' + ']' : ''}`, httpOptions);

  }
}
