import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable()
export class OrderService {
  private apiUrl = `${environment.apiUrl}order`;

  constructor(private http: HttpClient) {
  }

  getBuy(params) {
    const url = this.apiUrl;

    const httpOptions = {

      params: new HttpParams({
        fromObject: params,
      }),
    };

    return this.http.get(url + 's/buy', httpOptions);
  }

  getSell(params) {
    const url = this.apiUrl;

    const httpOptions = {
 
      params: new HttpParams({
        fromObject: params,
      }),
    };

    return this.http.get(url + 's/sell', httpOptions);
  }
  
  getOrder(id) {
    const url = this.apiUrl;

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };

    return this.http.get(url +'/'+ id, httpOptions);
  }
  postOrder(data){
    const url = this.apiUrl;

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };

    return this.http.post(url , data,httpOptions);
  }
  putOrderCancel(id, data) {
    const url = this.apiUrl;

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };

    return this.http.put(url +'/'+ id+'/request-cancel-order', data,httpOptions);
  }
  acceptOrderCancel(id) {
    const url = this.apiUrl;

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };

    return this.http.put(url +'/'+ id+'/accept-cancel-order',httpOptions);
  }
  requestScheduleOrder(id, data) {
    const url = this.apiUrl;

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };

    return this.http.put(url +'/'+ id+'/request-schedule-change', data,httpOptions);
  }
  acceptScheduleOrder(id) {
    const url = this.apiUrl;

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };

    return this.http.put(url +'/'+ id+'/accept-schedule-change',httpOptions);
  }

  requestLocationOrder(id, data) {
    const url = this.apiUrl;

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };

    return this.http.put(url +'/'+ id+'/request-location-change', data,httpOptions);
  }
  acceptLocationOrder(id) {
    const url = this.apiUrl;

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };

    return this.http.put(url +'/'+ id+'/accept-location-change',httpOptions);
  }
  getSellerStores(id) {
    const url = environment.apiUrl;

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };

    return this.http.get(url +'stores?userId='+id,httpOptions);
  }
  startService(id) {
    const url = this.apiUrl;

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };

    return this.http.put(url +'/'+ id+'/start-service',httpOptions);
  }
  completeService(id) {
    const url = this.apiUrl;

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };

    return this.http.put(url +'/'+ id+'/completed-service',httpOptions);
  }
  
  uploadFiles(id,data) {
    const url = this.apiUrl;

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };

    return this.http.put(url +'/'+ id+'/seller-delivered-media',data,httpOptions);
  }
  orderTaxAmount(subtotal,currencyCode,serviceId) {
    const url = this.apiUrl+`-tax?subtotal=${subtotal}&currencyCode=${currencyCode}&serviceId=${serviceId}`;

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };

    return this.http.get(url,httpOptions);
  }
  orderTransactionFee(subtotal,currencyCode,serviceId) {
    const url = this.apiUrl+`-transaction-fee?subtotal=${subtotal}&currencyCode=${currencyCode}&serviceId=${serviceId}`;

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };

    return this.http.get(url,httpOptions);
  }
  getFile(url) {
    return new Promise((resolve,reject)=>{
      fetch(url,{ method: 'GET'})
      .then((res)=>{
        if(res.ok){
          return res.blob()
        }
        reject(res);
      }).then(blob=>{resolve(blob);})
    })
  }

}