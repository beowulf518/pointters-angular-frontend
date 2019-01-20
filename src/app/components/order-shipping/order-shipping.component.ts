import { ToastrService } from 'ngx-toastr';
import { Component, OnInit, OnChanges, Output, EventEmitter, Input } from '@angular/core';
import { countries } from '../../interfaces/countries';
import { OrderService } from '../../services/order.service';
import { GeolocationService } from '../../services/geolocation.service';

const moment = require('moment');

@Component({
  selector: 'order-shipping',
  templateUrl: './order-shipping.component.html',
  styleUrls: ['./order-shipping.component.css']
})
export class OrderShippingComponent {

  private moment: any = moment;


  @Input() isBuyer: boolean;
  @Input() orderId: boolean;
  @Input() isSeller: boolean;
  @Input() isChangeable:boolean;
  @Input('shipmentInfo') shipInfo: any=false;
  @Input('buyerServiceLocation') servLoc: any=false;
  @Input('sellerAcceptedBuyerServiceLocation') acceptedLocal;

  @Output() shipmentSend = new EventEmitter();
  @Output() shipmentAccept = new EventEmitter();
  private countries: any = countries;
  private isChangeShipment = false;
  private shipment: any = {
    street1: '',
    city: '',
    state: '',
    zip: '',
    country: ''
  };
  private errorsShipment: any = [];

  constructor(
    private orderService: OrderService,
    private geoService: GeolocationService,
    private toastr: ToastrService,

  ) { }
  acceptShipment(){
    this.orderService.acceptLocationOrder(this.orderId)
    .subscribe(
      res => {
        this.toastr.success('Success!', 'Accept Location Order')
        this.shipmentAccept.emit(true);
      },
      err => {
        this.toastr.error('Some error accure', 'Accept Location Order')
        console.log('Request Schedule Order', err)
      }
    )
  }
  requestShipment() {
    let location = {
      buyerServiceLocation: {
        "street1": this.shipment.street1,
        "city": this.shipment.city,
        "state": this.shipment.state,
        "postalCode": this.shipment.zip,
        "geoJson": {},
        "country": this.shipment.country
      }
    }
    let address_str = this.shipment.street1 + " " + this.shipment.city + " " + this.shipment.state + " " + this.shipment.zip + " " + this.shipment.country
    let geoJson = { "type": "Point", "coordinates": [] }
    this.geoService.getGeoAddress(address_str)
      .then(
        res => {
          geoJson.coordinates = [res.results[0].geometry.location.lng, res.results[0].geometry.location.lat]
          location.buyerServiceLocation.geoJson = geoJson;
          this.orderService.requestLocationOrder(this.orderId, location)
            .subscribe(
              res => {
                this.toastr.success('Success!', 'Request Location Order');
                this.isChangeShipment=false;
                this.shipmentSend.emit(location);
              },
              err => {
                this.toastr.error('Some error accure', 'Request Location Order')
                console.log('Request Schedule Order', err)
              }
            )
        }
      )
  }
  ngOnChange(changes) {
    console.log('changes',changes);
    if(changes.servLoc.currentValue){}

  }
  ngOnInit() {
  }

}
