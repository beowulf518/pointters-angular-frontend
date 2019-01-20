import { Component,OnChanges, Input } from '@angular/core';
import { User } from './../../interfaces/user';
import { createNumberMask } from 'text-mask-addons';
import { ConversationService } from './../../services/conversation.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap/modal/modal';
import { ServiceAddComponent } from '../../routes/service/service-add/service-add.component';
import {RequestService} from '../../services/request.service';

const timeOptionsHash = {
  'week': 'Weeks',
  'hour': 'Hours',
  'day': 'Days'
};

@Component({
  selector: 'app-chat-message-request',
  templateUrl: './chat-message-request.component.html',
  styleUrls: ['./chat-message-request.component.css']
})
export class ChatMessageRequestComponent {
  @Input() item: any;
  @Input() user: User;
  @Input() goToDefaultView: any;
  @Input() toggleLinkService: any;
  @Input() linkedService: any;
  @Input() chatPartnerId: any;
  @Input() sendRequest: Function;
  @Input() service;
  @Input() noServices: boolean;
  @Input() deleteLinkedService: Function;


  private description: string;

  private shouldValidateRealTime = false;

  private offerId: string;

  private errorMessage = '';
  private btnDisabled = true;
  private dropdownShown = false;
  private disableClickOutside = false;
  private priceVal = 0;

  @Input() userHasNoService: boolean;


  private priceMask = createNumberMask({
    prefix: '$'
  });
  private selectedTime = {
    value: 'week', label: 'Weeks'
  };
  private radiusMask = createNumberMask({
    prefix: '',
    suffix: ' Miles',
    allowDecimal: false,
    includeThousandsSeparator: false,
    allowNegative: false,
    integerLimit: 5
  });
  private timeOptions = [
    { value: 'week', label: 'Weeks' },
    { value: 'day', label: 'Days' },
    { value: 'hour', label: 'Hours' }
  ];

  constructor(
    private conversationService: ConversationService,
    private requestService: RequestService,
    private modalService: NgbModal
  ) {  }

  ngOnInit() {
    if (this.userHasNoService) { this.btnDisabled = true; }
  }

  deleteCustomOffer() {
    if (this.offerId) {
      this.conversationService.deleteCustomOffer(this.offerId).subscribe(res => {
        console.log('Deleted custom offer', res);
      });
    }
    this.goToDefaultView();
  }

  validateInput = (isPriceInput?: boolean) => {
    if (this.noServices) { return; }
    if (isPriceInput) {
      this.priceVal = parseInt(this.service.price.substr(1).replace(/,/g, ''), 10);
      return;
    }

    if (!this.shouldValidateRealTime) { return; }

    const fields = Object.keys(this.service);
    let invalid = false;
    fields.map((el, i) => {
      if (
        el === 'sellerId'
        || el === 'buyerId'
        || el === 'location'
        || el === 'currencyCode'
        || el === 'currencySymbol'
        || el === 'serviceId'
      ) { return; }

      // if (el === 'serviceId' && !this.service['serviceId']) {
      //     invalid = true;
      //     this.errorMessage = 'No service selected';
      //     return;
      // }


      if (el === 'parcel' && this.service.fulfillmentMethod['shipment']) {
        const parcelKeys = Object.keys(this.service['parcel']);
        parcelKeys.map(key => {
          if (!this.service['parcel'][key]) {
            invalid = true;
            this.errorMessage = 'Invalid shipping data!';
          }
        });
      } else if (el === 'address' && this.service.fulfillmentMethod['shipment']) {
        const addressKeys = Object.keys(this.service['address']);
        addressKeys.map(key => {
          if (!this.service['address'][key]) {
            if (key === 'street2' || key === 'phone') { return; }
            invalid = true;
            this.errorMessage = 'Invalid shipping address!';
          }
        });
      } else if (el === 'fulfillmentMethod') {
        const methodKeys = Object.keys(this.service[el]);
        let methodInvalid = true;
        methodKeys.map(key => {

          if (
            key !== 'localServiceRadius'
            && key !== 'localServiceRadiusUom'
            && key !== 'local'
          ) {
            if (this.service.fulfillmentMethod[key]) {
              methodInvalid = false;

            }
          } else if (key === 'local') {
            if (
              this.service.fulfillmentMethod[key]
              && this.service.fulfillmentMethod['localServiceRadius']) {
              methodInvalid = false;
            }
          }
        });

        if (methodInvalid) {
          invalid = true;
          this.errorMessage = 'Form contains invalid data!';
        }
      }

      // if (!this.service[el]) {

      // if (el === 'address' && !this.service.fulfillmentMethod['shipment']) return;
      // if (el === 'parcel' && !this.service.fulfillmentMethod['shipment']) return;

      if (!this.service[el]) {
        invalid = true;
        this.errorMessage = 'Form contains invalid fields!';
      }
      //}

    });

    if (!invalid) {
      this.errorMessage = '';
      this.btnDisabled = false;
    } else {
      this.btnDisabled = true;
    }
  }

  showDropdown() {
    if (this.disableClickOutside) {
      this.disableClickOutside = false;
      return;
    }
    this.dropdownShown = !this.dropdownShown;
  }


  ngOnChanges(changes) {
    if (changes.noServices && changes.noServices.currentValue) {
      this.btnDisabled = true;
      this.errorMessage = 'Please add at least one service to your profile';
    }
    if (changes.linkedService && changes.linkedService.currentValue) {

      const serviceToConvert = changes.linkedService.currentValue;
      const serviceData = {};
      this.btnDisabled = false;

      if (serviceToConvert.service['media'] && serviceToConvert.service['media']['_id']) {
        delete serviceToConvert.service['media']['_id'];
        serviceData['media'] = [serviceToConvert.service['media']];
      }

      this.service.serviceId = serviceToConvert.service.id;
      this.service['media'] = serviceData['media'];
      //console.log('Service data from linked service', serviceData);
      // Object.assign(this.service, serviceData);

      this.errorMessage = '';
      this.validateInput();


    }
  }

  getDistance(coordinates1) {
    if (!this.user.location || !this.user.location.geoJson) { return '0km'; }
    return (
      this.getDistanceFromLatLonInKm(
        coordinates1[0],
        coordinates1[1],
        this.user.location.geoJson.coordinates[0],
        this.user.location.geoJson.coordinates[1]
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

  sendService() {

    console.log(this.linkedService);
    console.log(this.chatPartnerId);


    if (this.btnDisabled) { return; }

    this.requestService.createRequest({
      'isPrivate': true,
      'serviceId': this.linkedService.service.id,
      'description': this.service.description,
    }).subscribe(res => {
      console.log(res)
      this.sendRequest(res["_id"]);
    });




  }

}
