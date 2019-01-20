import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GoogleMapsAPIWrapper, LatLngBounds, LatLng } from '@agm/core';
import { OrderService } from '../../services/order.service';
import { UserService } from '../../services/user.service';
import { As3Service } from '../../services/as3.service';
import { ServiceService } from '../../services/service.service';
import { GeolocationService } from '../../services/geolocation.service';
import { SellLocationService } from '../../services/sell-location.service';
import { ToastrService } from 'ngx-toastr';
import turf from '@turf/distance';
import * as JSZip from 'jszip';
import * as flSave from 'file-saver';
import mapStyle from '../../interfaces/map-style';
import { User } from '../../interfaces/user';
import { countries } from '../../interfaces/countries';
import { BoundCallbackObservable } from 'rxjs/observable/BoundCallbackObservable';
import { SSL_OP_NETSCAPE_CHALLENGE_BUG } from 'constants';

declare var google: any;
declare var $: any;

const uuid = require('uuid/v4');
const moment = require('moment');

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css', './picker.css']
})

export class OrderComponent implements OnInit {

  private transactionFee: any = false;
  private subtotalBuyAmount: any = 0;
  private checkOutData: any = {};
  subtotalTimeAmount: number=0;
  private isEmptyOrder: any = true;


  private orderId: any = '';
  private isBuyer = false;
  private isChangeSchedule = false;
  private isChangeLocation = false;
  private isCancelation = false;
  private isDeliveryFiles = false;
  private isPreparingZip = false;

  private isServiceLocationHidden = false;
  private isSeller = false;
  private serviceType: any = '';
  private orderStart = false;
  private serviceStartCheck: any = {
    'local': () => { this.isSeller && this.order.serviceScheduleDate && this.order.sellerAcceptedScheduleTime && this.order.buyerServiceLocation && this.order.sellerAcceptedBuyerServiceLocation ? this.orderStart = true : this.orderStart = false; },
    'store': () => { this.isSeller && this.order.serviceScheduleDate && this.order.sellerAcceptedScheduleTime ? this.orderStart = true : this.orderStart = false; },
    'online': () => { this.isSeller && this.order.serviceScheduleDate && this.order.sellerAcceptedScheduleTime ? this.orderStart = true : this.orderStart = false; },
    'shipment': () => { this.isSeller ? this.orderStart = true : this.orderStart = false; }
  };
  private orderComplete = false;

  private serviceCompleteCheck: any = {
    'local': () => { this.isSeller ? this.orderComplete = true : this.orderComplete = false; },
    'store': () => { this.isSeller ? this.orderComplete = true : this.orderComplete = false; },
    'online': () => { console.log('Check, ', this.upFiles); this.isSeller && this.upFiles.length ? this.orderComplete = true : this.orderComplete = false; },
    'shipment': () => { this.isSeller ? this.orderComplete = true : this.orderComplete = false; }
  };

  private getTitle: any = () => {
    if (this.serviceType == 'local') {
      if (!this.order.serviceScheduleDate && !this.order.buyerServiceLocation && !this.order.buyerOrderDispute && !this.order.serviceStartDate)
        return 'Next Step: Buyer to propose schedule and location';

      if (this.order.serviceScheduleDate && !this.order.buyerServiceLocation && !this.order.buyerOrderDispute && !this.order.serviceStartDate)
        return 'Next Step: Buyer to propose location';

      if (!this.order.serviceScheduleDate && this.order.buyerServiceLocation && !this.order.buyerOrderDispute && !this.order.serviceStartDate)
        return 'Next Step: Buyer to propose schedule';

      if (this.order.serviceScheduleDate && this.order.buyerServiceLocation && !this.order.sellerAcceptedBuyerServiceLocation && !this.order.sellerAcceptedScheduleTime && !this.order.buyerOrderDispute && !this.order.serviceStartDate)
        return 'Next Step: Seller to accept schedule and location';

      if (this.order.serviceScheduleDate && this.order.buyerServiceLocation && this.order.sellerAcceptedBuyerServiceLocation && !this.order.sellerAcceptedScheduleTime && !this.order.buyerOrderDispute && !this.order.serviceStartDate)
        return 'Next Step: Seller to accept schedule';

      if (this.order.serviceScheduleDate && this.order.buyerServiceLocation && !this.order.sellerAcceptedBuyerServiceLocation && this.order.sellerAcceptedScheduleTime && !this.order.buyerOrderDispute && !this.order.serviceStartDate)
        return 'Next Step: Seller to accept location';

      if (this.order.serviceScheduleDate && this.order.buyerServiceLocation && this.order.sellerAcceptedBuyerServiceLocation && this.order.sellerAcceptedScheduleTime && !this.order.serviceStartDate && !this.order.buyerOrderDispute && !this.order.serviceStartDate)
        return 'Next Step: Seller to start service';
    }
    if(this.serviceType == 'online' || this.serviceType == 'shipment'){
      if (!this.order.serviceStartDate && !this.order.buyerOrderDispute && !this.order.serviceStartDate)
      return 'Next Step: Seller to start service';
    }
    if(this.serviceType == 'store'){
      if (!this.order.serviceScheduleDate && !this.order.buyerOrderDispute && !this.order.serviceStartDate)
        return 'Next Step: Buyer to propose schedule';

      if (this.order.serviceScheduleDate && !this.order.sellerAcceptedScheduleTime && !this.order.buyerOrderDispute && !this.order.serviceStartDate)
        return 'Next Step: Seller to accept schedule';
    }

    if (this.order.serviceStartDate && !this.order.serviceCompleteDate && !this.order.review && !this.order.buyerOrderDispute)
      return 'Next Step: Seller to complete service';

    if (this.order.serviceStartDate && this.order.serviceCompleteDate && !this.order.review && !this.order.buyerOrderDispute)
      return 'Next Step: Buyer to do acceptance';

    if (this.order.serviceStartDate && this.order.serviceCompleteDate && this.order.review && !this.order.buyerOrderDispute)
      return 'Next Step: Order Closed';

    if (this.order.buyerOrderDispute && !this.order.sellerAcceptedBuyerDispute)
      return 'Next Step: Seller to review cancellation ...';

    if (this.order.buyerOrderDispute && this.order.sellerAcceptedBuyerDispute)
      return 'Order Cancelled';
  }

  private setMedia: any = {

  }
  private totalAmount: any = false;
  private buyerReview: any = undefined;
  // Files Upload
  private upFiles: any = [];
  private isFileSending = false;

  // Calcelation
  private reason: any = 'not_on_time';
  private message: any = '';
  // Schedule
  private serviceSchedule: any = moment().format('MM/DD/YYYY');
  private timePickerOpen = false;
  private displayStartDate: any;
  private displayEndDate: any;

  private startDate: any;
  private endDate: any;
  // Location
  private location: any = {
    street1: '',
    city: '',
    state: '',
    zip: '',
    country: ''
  };
  private errorsLocation: any = [];
  private countries: any = countries;
  private BuyerMarkers: any = [];
  private serviceMarkers: any = [];
  private generalMap: any = false;
  public overlays: object = {};
  public bounds: LatLngBounds;
  public sellerStore: any = false;
  public selectedStore: any = false;

  // Shipment Vars

  // Service Vars
  private seller: any = false;
  private order: any = false;
  private service: any = false;
  private mapStyle: any = mapStyle;
  private map: any;
  private datePickerOpen = false;
  public user: User;
  public turf = turf;
  private moment: any = moment;

  // Shipment Vars
  private isShipmentBlock = false;
  noActiveStores: boolean;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private as3Service: As3Service,
    private orderService: OrderService,
    private userService: UserService,
    private serviceService: ServiceService,
    private geoService: GeolocationService,
    private sellLocationService: SellLocationService,
    private OrderService: OrderService,

    private toastr: ToastrService,
  ) { }

  startDateChange() {
    var sTime = moment(this.startDate);
    this.endDate = moment(this.startDate).add(this.order.totalWorkDurationHours, 'h').format('MM/DD/YYYY, h:mm A');
    this.displayStartDate = moment(this.startDate).format('MM/DD/YYYY, h:mm A');
    this.displayEndDate = moment(this.startDate).add(this.order.totalWorkDurationHours, 'h').format('MM/DD/YYYY, h:mm A');
    console.log(this.startDate);
  }
  reviewSended(event) {
    console.log("reviewSended", event)
    this.order['review'] = event;
  }

  shipmentSend(event) {
    this.order['buyerServiceLocation'] = event['buyerServiceLocation'];
  }
  shipmentAccept(event) {
    this.order['sellerAcceptedBuyerServiceLocation'] = event;
  }

  loadAPIWrapper = (map) => { this.map = map; }
  startService() {
    this.orderService.startService(this.orderId)
      .subscribe(
        res => {
          this.toastr.success('Success!', 'Start Service');
          this.order['serviceStartDate'] = moment(new Date()).utc().toISOString();
        },
        err => {
          this.toastr.error('Some error accure', 'Start Service');
        }
      );
  }
  completeService() {
    this.orderService.completeService(this.orderId)
      .subscribe(
        res => {
          this.toastr.success('Success!', 'Complete Service');
          this.order['serviceCompleteDate'] = moment(new Date()).utc().toISOString();
        },
        err => {
          this.toastr.error('Some error accure', 'Complete Service');
        }
      );
  }
  // File Upload
  fileChanged() {
    const fileInput = document.getElementById('files_order');
    const files: FileList = fileInput['files'];
    if (files.length === 0) {
      this.upFiles = [];
      return;
    }
    this.upFiles = Array.from(files).map((file, index, arr) => {
      let mediaType = 'document';
      if (file.type) {
        switch (file.type.split('/')[0]) {
          case 'image': mediaType = 'image'; break;
          case 'video': mediaType = 'video'; break;
          case 'audio': mediaType = 'audio'; break;
          default: mediaType = 'document'; break;
        }
      }
      return {
        file: file,
        fileLink: false,
        fileName: file.name, // include file extension in the name
        mediaType: mediaType,
      };
    });
  }
  fileSubmit() {
    this.isFileSending = true;
    this.as3Service.uploadMedia(this.upFiles).subscribe(
      (res) => {
        const payload = {
          'sellerDeliveredMedia': [...this.upFiles.map((media, index) => {
            return {
              mediaType: media.mediaType,
              fileName: res[index]['path'],
            };
          })]
        };
        this.orderService.uploadFiles(this.orderId, payload)
          .subscribe(resp => {
            this.toastr.success('Success!', 'uploadFiles');
            this.serviceCompleteCheck[this.serviceType]();
            this.isFileSending = false;
          },
            err => {
              this.toastr.error('Some error accure', 'uploadFiles');
              this.isFileSending = false;
            }
          );
      },
      err => {
        this.toastr.error('Some error accure', 'uploadFiles to as3');
        console.log('this.as3Service.uploadMedia ', err);
      }
    );
  }
  fileClean() {
    $('#files_order').val('');
    this.fileChanged();
    this.serviceCompleteCheck[this.serviceType]();
  }
  fileSaveAll() {
    this.isPreparingZip = true;
    const zip = new JSZip();
    const promiseArray = [];
    this.upFiles.map(element => {
      promiseArray.push(this.orderService.getFile(element.fileLink));
    });
    Promise.all(promiseArray)
      .then(res => {
        res.map((element, index) => {
          zip.file(this.upFiles[index].fileName, element);
        });
        zip.generateAsync({ type: 'blob' })
          .then((content) => {
            this.isPreparingZip = false;
            flSave.saveAs(content, 'example.zip');
          });
      });
  }
  // Schedule Change
  requestSchedule() {
    let payload = { serviceScheduleDate: moment(this.startDate).utc().toISOString(), serviceScheduleEndDate: moment(this.endDate).utc().toISOString() }
    this.orderService.requestScheduleOrder(this.orderId, payload)
      .subscribe(
        res => {
          //this.setTimeDisplay(payload.serviceScheduleDate, payload.serviceScheduleEndDate)
          this.endDate = undefined;
          this.startDate = undefined;
          this.order['serviceScheduleDate'] = payload.serviceScheduleDate
          this.order['serviceScheduleEndDate'] = payload.serviceScheduleEndDate
          this.order['sellerAcceptedScheduleTime'] ? this.order['sellerAcceptedScheduleTime'] = false : null;
          this.serviceStartCheck[this.serviceType]();
          this.isChangeSchedule = false;
        },
        err => {
          this.isChangeSchedule = false;
          this.toastr.error(err.error.message, 'Request Schedule Order')
          console.log('Request Schedule Order', err)
        }
      )
  }
  acceptSchedule() {
    this.orderService.acceptScheduleOrder(this.orderId)
      .subscribe(
        res => {
          this.order['sellerAcceptedScheduleTime'] = true;
          this.serviceStartCheck[this.serviceType]();
        },
        err => {
          this.toastr.error('Some error accure', 'Accept Schedule Order')
          console.log('Request Schedule Order', err)
        }
      )
  }
  toggleTimePicker = (val: boolean) => { this.timePickerOpen = val; }
  toggleDatePicker(val: boolean) { this.datePickerOpen = val; }
  setTimeDisplay(start, end) {
    this.displayStartDate = moment(start).format('MM/DD/YYYY, h:mm A');
    this.displayEndDate = moment(end).format('MM/DD/YYYY, h:mm A');
  }
  //Location Change
  selectViewStore(item) {
    this.selectedStore = item;
  }
  getDistance(coords) {
    if (!this.user.location || !this.user.location.geoJson) return '0km';
    return (
      this.getDistanceFromLatLonInKm(
        this.user.location.geoJson.coordinates[0],
        this.user.location.geoJson.coordinates[1],
        coords[0],
        coords[1]
      ) + ' km'
    );
  }
  getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1); // deg2rad below
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
      Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distace in km
    return Math.floor(d);
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  acceptLocation() {
    this.orderService.acceptLocationOrder(this.orderId)
      .subscribe(
        res => {
          this.toastr.success('Success!', 'Accept Location Order')
          this.order['sellerAcceptedBuyerServiceLocation'] = true;
        },
        err => {
          this.toastr.error('Some error accure', 'Accept Location Order')
          console.log('Request Schedule Order', err)
        }
      )
  }
  requestLocationStore() {
    let location = {
      buyerServiceLocation: {
        "street1": this.selectedStore.street1,
        "city": this.selectedStore.city,
        "state": this.selectedStore.state,
        "postalCode": this.selectedStore.zip,
        "geoJson": this.selectedStore.geoJson,
        "country": this.selectedStore.country
      }
    }
    this.orderService.requestLocationOrder(this.orderId, location)
      .subscribe(
        res => {
          this.toastr.success('Success!', 'Request Location Order')
          this.order['buyerServiceLocation'] = location.buyerServiceLocation;
          this.serviceStartCheck[this.serviceType]();
          this.resetLocation()
        },
        err => {
          this.toastr.error('Some error accure', 'Request Location Order')
          console.log('Request Schedule Order', err)
        }
      )
  }
  requestLocation() {
    if (this.sellerStore) { this.requestLocationStore(); }
    if (this.validation(this.location, this.errorsLocation)) {
      let location = {
        buyerServiceLocation: {
          "street1": this.location.street1,
          "city": this.location.city,
          "state": this.location.state,
          "postalCode": this.location.zip,
          "geoJson": {},
          "country": this.location.country
        }
      }
      let address_str = this.location.street1 + " " + this.location.city + " " + this.location.state + " " + this.location.zip + " " + this.location.country
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
                  this.order['sellerAcceptedBuyerServiceLocation'] = false;
                  this.order['buyerServiceLocation'] = location.buyerServiceLocation;
                  this.BuyerMarkers = [location.buyerServiceLocation];
                  this.serviceStartCheck[this.serviceType]();
                  this.resetLocation()
                },
                err => {
                  this.toastr.error('Some error accure', 'Request Location Order')
                  console.log('Request Schedule Order', err)
                }
              )
          }
        )
    }

  }
  resetLocation() {
    this.overlays = {};
    this.selectedStore = false;
    this.isChangeLocation = false;
    this.location = {
      street1: '',
      city: '',
      state: '',
      zip: '',
      country: ''
    }
  }

  addOverlayKey = (key) => {
    this.overlays[key] = true;
  }
  removeOverlayKey = (key) => {
    if (this.overlays[key]) delete this.overlays[key];
  }

  validation(source, error) {
    if (!source.street1) { error['street1'] = [{ message: 'This field required' }]; return false; }
    if (!source.city) { error['city'] = [{ message: 'This field required' }]; return false; }
    if (!source.state) { error['state'] = [{ message: 'This field required' }]; return false; }
    if (!source.zip) { error['zip'] = [{ message: 'This field required' }]; return false; }
    if (!source.country) { error['country'] = [{ message: 'This field required' }]; return false; }
    return true;
  }
  //Cancelation
  acceptCancelation() {
    this.orderService.acceptOrderCancel(this.orderId)
      .subscribe(res => {
        this.toastr.success('Your Cancelation accepted!', 'Cancelation accepted!')
        this.order['sellerAcceptedBuyerDispute'] = true;
        console.log('putOrderCancel', res)
      },
        err => {
          this.toastr.error(err['error'].message, 'Cancelation failed!')
          console.log('putOrderCancel err', err)
        }
      )
  }

  initServiceInfo(service) {
    if (service.service.fulfillmentMethod.local) {
      this.serviceType = 'local';
      this.serviceStartCheck[this.serviceType]();
      this.serviceCompleteCheck[this.serviceType]();
      let meetets = service.service.fulfillmentMethod.localServiceRadius * 1.60934 * 1000;//convert milles from API into meters;
      if (!this.generalMap) {
        this.generalMap = {
          geoJson: {
            type: service.service.location[0].geoJson.type,
            coordinates: [service.service.location[0].geoJson.coordinates[0], service.service.location[0].geoJson.coordinates[1]]
          }
        }
      }
      this.serviceMarkers = [{
        radius: meetets,
        geoJson: {
          type: service.service.location[0].geoJson.type,
          coordinates: [service.service.location[0].geoJson.coordinates[0], service.service.location[0].geoJson.coordinates[1]]
        }
      }]
      this.serviceMarkers[0].geoJson.coordinates = this.serviceMarkers[0].geoJson.coordinates.reverse();
      this.generalMap.geoJson.coordinates = this.generalMap.geoJson.coordinates.reverse();
      console.log('this.generalMap ', this.generalMap)
      console.log('this.serviceMarkers ', this.serviceMarkers)

    }
    if (service.service.fulfillmentMethod.store) {
      this.serviceType = 'store';
      this.serviceStartCheck[this.serviceType]();
      this.serviceCompleteCheck[this.serviceType]();
      this.BuyerMarkers = false;
      this.orderService.getSellerStores(this.order['sellerId'])
        .subscribe(
          res => {
            let storebuffer = res['docs'];
            let promiseArray = [...res['docs'].map(element => {
              let address_str = element.street1 + " " + element.city + " " + element.state + " " + element.zip + " " + element.country
              return this.geoService.getGeoAddress(address_str);
            })];

            Promise.all(promiseArray).then(res => {
              res.map((element, index) => {
                storebuffer[index]['geoJson'] = { "type": "Point", "coordinates": [element.results[0].geometry.location.lng, element.results[0].geometry.location.lat] };
              })
              this.sellerStore = storebuffer;
              this.generalMap = {
                geoJson: {
                  type: this.sellerStore[0].geoJson.type,
                  coordinates: [this.sellerStore[0].geoJson.coordinates[0], this.sellerStore[0].geoJson.coordinates[1]]
                }
              }
            })
          },
          err => {
            //this.toastr.error(err['error'].message, 'Store map failed!')
            this.generalMap = false;
            this.noActiveStores = true;
            console.log('getSellerStores err', err)
          }
        )
    }
    if (service.service.fulfillmentMethod.online) {
      this.serviceType = 'online';
      this.serviceStartCheck[this.serviceType]();
      this.serviceCompleteCheck[this.serviceType]();

      this.isDeliveryFiles = true;
      this.isServiceLocationHidden = true;
    }
    if (service.service.fulfillmentMethod.shipment) {
      this.serviceType = 'shipment';
      this.serviceStartCheck[this.serviceType]();
      this.serviceCompleteCheck[this.serviceType]();
      this.isServiceLocationHidden = true;
      this.isShipmentBlock = true;
    }
  }
  ngOnInit() {

    //get transactionFee
  this.getTaxesTreansactionFee(this.transactionFee,this.transactionFee,this.transactionFee);

    this.serviceService.getReview('5b3e0fd0a83a7f419b613f23')
      .subscribe(
        res => {
          console.log('this.serviceService.getReview', res)
        },
        err => {
          console.log('this.serviceService.getReview', err)
        }
      )


    this.orderId = this.route.snapshot.params["id"];
    this.userService.user.subscribe(user => {
      if (user == null) return;
      this.user = user;
      this.orderService.getOrder(this.orderId)
        .subscribe(
          res => {
            //if order dispute was opened by buyer!
            if (res['order'].buyerOrderDispute) {
              this.reason = res['order'].buyerOrderDispute.reason
              this.message = res['order'].buyerOrderDispute.message
            }
            this.order = res['order'];
            // Check is current user Seller or Buyer
            res['order'].buyerId == this.user['_id'] ? this.isBuyer = true : null;
            res['order'].sellerId == this.user['_id'] ? this.isSeller = true : null;

            //if Schedule exist
            if (res['order'].serviceScheduleDate && res['order'].serviceScheduleEndDate) {
              this.setTimeDisplay(res['order'].serviceScheduleDate, res['order'].serviceScheduleEndDate)
            }

            //update BuyerMarkers on map
            if (res['order'].buyerServiceLocation) {
              this.generalMap = {
                geoJson: {
                  type: res['order'].buyerServiceLocation.geoJson.type,
                  coordinates: [res['order'].buyerServiceLocation.geoJson.coordinates[1], res['order'].buyerServiceLocation.geoJson.coordinates[0]]
                }
              }
              this.BuyerMarkers = [res['order'].buyerServiceLocation];
            }
            //Update uploaded files
            if (res['order'].sellerDeliveredMedia) {
              this.upFiles = [...res['order'].sellerDeliveredMedia.map(element => {
                return {
                  mediaType: element.mediaType,
                  fileName: element.fileName.replace('https://s3.amazonaws.com/pointters_dev/dev/', ''),
                  fileLink: element.fileName,
                }
              })];
            }
            //Recalculate Total Amount
            res['order'].orderItems.map(element => {
              this.totalAmount += element.price * element.quantity;
            });

            // Getting additional data
            console.log('Order', res['order'])
            this.userService.getUserProfile(res['order']['sellerId'])
              .subscribe(res => {
                this.seller = res['result'];
                console.log('seller', res['result'])
              })
            this.serviceService.getDetail(res['order']['serviceId'])
              .subscribe(res => {
                this.service = res['result'];
                if (res['result']['reviews'] !== undefined) {
                  //this.checkReviews(res['result']['reviews']);
                }
                this.initServiceInfo(res['result']);
                console.log('serviceService', res['result'])
              })
          }
        )
    });

  }



  // Need delete what dont used
  recalculateTotalPrice() {

    if (this.checkOutData['service']) {

      let i = 0, hourMultiplier=0;
      this.subtotalBuyAmount = 0;
      this.subtotalTimeAmount = 0;
      this.checkOutData.service.object.prices.forEach(element => {

        // getting multiplier to get total HOURS
        if (element.timeUnitOfMeasure == "hour") { hourMultiplier = 1; }
        else if (element.timeUnitOfMeasure = "day") { hourMultiplier = 24; }
        else if (element.timeUnitOfMeasure = "week") { hourMultiplier = 168; }

        this.subtotalTimeAmount += this.checkOutData.service.buyCount[i] * hourMultiplier * element.time
        this.subtotalBuyAmount += element.price * this.checkOutData.service.buyCount[i];
        i++;
      });
      this.subtotalBuyAmount == 0 ? this.isEmptyOrder = true : this.isEmptyOrder = false;
      this.getTaxesTreansactionFee(this.subtotalBuyAmount, this.checkOutData.service.object.prices[0].currencyCode, this.checkOutData.service.object.id)


    } else if (this.checkOutData['customeOffer']) {
      let i = 0, hourMultiplier=0;

      // getting multiplier to get total HOURS
      if (this.checkOutData.customeOffer.object.timeUnitOfMeasure == "hour") { hourMultiplier = 1; }
      else if (this.checkOutData.customeOffer.object.timeUnitOfMeasure = "day") { hourMultiplier = 24; }
      else if (this.checkOutData.customeOffer.object.timeUnitOfMeasure = "week") { hourMultiplier = 168; }

      this.subtotalTimeAmount += this.checkOutData.customeOffer.buyCount * hourMultiplier * this.checkOutData.customeOffer.object.time;
      this.subtotalBuyAmount = this.checkOutData.customeOffer.object.price * this.checkOutData.customeOffer.buyCount;

      this.subtotalBuyAmount == 0 ? this.isEmptyOrder = true : this.isEmptyOrder = false;
      this.getTaxesTreansactionFee(this.subtotalBuyAmount, this.checkOutData.customeOffer.object.currencyCode, this.checkOutData.customeOffer.object.serviceId)

    }
  }
  // Need delete what dont used
  getTaxesTreansactionFee(subtotal, currencyCode, serviceId) {
    let promisePayload = [
      new Promise((resolve, reject) => {
        this.OrderService.orderTaxAmount(subtotal, currencyCode, serviceId)
          .subscribe(res => { resolve(res) }, err => { reject(err) });
      }),
      new Promise((resolve, reject) => {
        this.OrderService.orderTransactionFee(subtotal, currencyCode, serviceId)
          .subscribe(res => { resolve(res) }, err => { reject(err) });
      })
    ]
    Promise.all(promisePayload)
      .then(
        res => {
          this.transactionFee = res[1]
          console.log(this.transactionFee)
        }
      )
  }

}
