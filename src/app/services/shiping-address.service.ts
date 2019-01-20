import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './../../environments/environment';


import { AuthService } from './auth.service';

@Injectable()
export class ShipingAddressService {

  private apiUrl = `${environment.apiUrl}`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getShipingAddress() {
    let url = this.apiUrl + 'shipment-addresses';
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authService.token}`
      })
    };
    return this.http.get(url, httpOptions);
  }
  addShipingAddress(data) {
    let url = this.apiUrl + 'shipment-address';
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authService.token}`
      })
    };
    return this.http.post(url, data, httpOptions);
  }
  updateShipingAddress(id,data) {
    let url = this.apiUrl + 'shipment-address/'+id;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authService.token}`
      })
    };
    return this.http.put(url, data, httpOptions);
  }
  deleteShipingAddress(id) {
    let url = this.apiUrl + 'shipment-address/'+id;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authService.token}`
      })
    };
    return this.http.delete(url, httpOptions);
  }
  placeShipingAddress(payload) {
    let url = this.apiUrl + 'shipment';
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authService.token}`
      })
    };
    return this.http.post(url, payload ,httpOptions);
  }
  getShipingInfo(id) {
    let url = this.apiUrl + 'shipment/';
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authService.token}`
      })
    };
    return this.http.get(url+id+'/rates' ,httpOptions);
  }
  
  updateShipmentRate(id,rate) {
    let url = this.apiUrl + 'shipment/';
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authService.token}`
      })
    };
    return this.http.put(url+id,rate ,httpOptions);
  }
}
