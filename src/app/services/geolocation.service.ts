import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthService } from './auth.service';


const publicIp = require("public-ip");
const iplocation = require("iplocation");

@Injectable()
export class GeolocationService {
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getCurrentLocation() {
    return Observable.fromPromise(
      publicIp.v4().then(ip => {
        return iplocation(['https://ipapi.co/*/json'], ip)
      })
    ).map((res: any) => {
      // console.log(res.postalCode)
      // console.log(res.postal)

      // if (!res.postalCode || res.postal == "") {
      //   res.postal = "0";
      // }
      if (res.postalCode == "" || res.postal == "") {
        res.postal = "0";
      }

      return {
        city: res.city,
        country: res.country_name,
        geoJson: {
          type: "Point",
          coordinates: [res.longitude, res.latitude]
        },
        postalCode: res.postal,
        province: res.region,
        state: res.region_code,
      };

    });
  }
  getGeoAddress(address_str) {
    const url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + address_str+"&key=AIzaSyBkkcBsJrCmn7w4LEMhUR8nDeFmnQ9hJN8";
    return fetch(url).then(res=>{
      if(res.status == 200) return res.json();
      console.log(res);
    });

  }
}
