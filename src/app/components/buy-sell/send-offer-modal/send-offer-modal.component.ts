import { Component, OnInit, OnDestroy } from '@angular/core';
import { OfferService } from '../../../services/offer.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { currentId } from 'async_hooks';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap/modal/modal';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap/modal/modal-ref';
import { User } from '../../../interfaces/user';
import { UserService } from '../../../services/user.service';
import { ServiceService } from '../../../services/service.service';
import { createNumberMask } from 'text-mask-addons';
import { JobDetailModalComponent } from '../job-detail/job-detail.component';
import { ServiceAddComponent } from '../../../routes/service/service-add/service-add.component';
import $ from 'jquery';

var moment = require('moment');

@Component({
  selector: 'app-send-offer-modal',
  templateUrl: './send-offer-modal.component.html',
  styleUrls: ['./send-offer-modal.component.css']
})
export class SendOfferModalComponent implements OnInit {

  private model: any;
  private id: string;
  private linkedJobId: string;

  private editable: boolean = false;
  private offerToEdit: any = null;

  private noServices: boolean = false;

  private user: User;
  private moment: any = moment;
  private formInvalid: boolean = false;
  private allowValidation: boolean = false;
  private priceMask = createNumberMask({
    prefix: '$'
  });

  private shipping = {
    address: {
      street1: "",
      street2: "",
      city: "",
      state: "",
      zip: "",
      country: "US"
    },
    parcel: {
      length: "",
      width: "",
      height: "",
      weight: ""
    }
  };

  private country;

  private radiusMask = createNumberMask({
      prefix: '',
      suffix: ' Miles',
      allowDecimal: false,
      includeThousandsSeparator: false,
      allowNegative: false,
      integerLimit: 5
  });

  private offer = {
    buyerId: '',
    sellerId: '',
    serviceId: '5af303e4812c723037dc2ca7',
    price: undefined,
    location: {},
    media: [],
    currencyCode: 'USD',
    currencySymbol: '$',
    workDuration: '1',
    workDurationUom: 'hour',
    description: '',
    fulfillmentMethod: {
      local: false,
      localServiceRadius: '25 Miles',
      localServiceRadiusUom: 'mile',
      online: false,
      shipment: false,
      store: false
    }
  }

  private selectedTime = {
    value: 'week', label: 'Weeks'
  };
  private timeOptions = [
    { value: 'week', label: 'Weeks' },
    { value: 'day', label: 'Days' },
    { value: 'hour', label: 'Hours' }
  ];

  constructor(
    private offerService: OfferService,
    private userService: UserService,
    private activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private serviceService: ServiceService,
    private router: Router,
  ) {

   }

  ngOnInit() {
    // console.log('model', this.model);
    if (this.editable) {
      console.log('editable', this.offerToEdit);
      this.offer = this.offerToEdit;

      let editableOffer: any = this.offerToEdit;

      if (editableOffer && editableOffer['parcel']) {
        this.shipping.parcel = editableOffer['parcel']
      }
      if (editableOffer && editableOffer['address']) {
        this.shipping.address = editableOffer['address'];
      }

    }

    this.offer.buyerId = this.model.userId;
    this.offer.media = this.model['media'];



    this.userService.user.subscribe(user => {
      this.user = user;
      this.offer.sellerId = user._id;
      this.offer.location = this.user.location; // TEMP use user's location


      this.serviceService.getServices(user._id)
        .first()
        .subscribe((res) => {
          if (res && res.docs.length > 0) {
            this.noServices = false;
          } else {
            this.noServices = true;
          }
        },
        (err) => {
          this.noServices = true;
        })

    });

    this.validateForm();

    // Let to type only numbers
    $(document).ready(function () {
      $('#time-to-complete').keypress(function (key) {
        if (!(key.charCode < 97 || key.charCode > 122) && (key.charCode < 65 || key.charCode > 90) && (key.charCode != 45) && (key.charCode != 32) && (key.charCode != 0)  ) return false;
      });
    });

  }

  handleCountryChange(val: string) {
    this.shipping.address.country = val;
  }

  createService() {
    this.activeModal.close();
    const modalRef = this.modalService.open(ServiceAddComponent);
    const serviceAddComponent : ServiceAddComponent = modalRef.componentInstance as ServiceAddComponent

    serviceAddComponent.successHandler.subscribe(() => {
      modalRef.close();
      this.noServices = false;
    })
  }


  handleFulfillmentMethod(type, currentVal) {
    // let currentVal = this.offer.fulfillmentMethod[type];

    this.offer.fulfillmentMethod['local'] = false;
    this.offer.fulfillmentMethod['online'] = false;
    this.offer.fulfillmentMethod['shipment'] = false;
    this.offer.fulfillmentMethod['store'] = false;

    this.offer.fulfillmentMethod[type] = currentVal;
    this.validateForm();

  }

  changeLocalRadius = (type) => {
    let serviceRadius: any = this.offer.fulfillmentMethod.localServiceRadius;

    let val = typeof serviceRadius === 'string'
      ? parseInt(serviceRadius.substr(0, serviceRadius.length - 6), 10)
      : serviceRadius

    if (type === '+') {
      this.offer.fulfillmentMethod.localServiceRadius = `${val + 1} Miles`;
    } else if (val > 0){
      this.offer.fulfillmentMethod.localServiceRadius = `${val - 1} Miles`;
    }
  }


  sendOffer() {
    this.allowValidation = true;
    this.validateForm();
    if (this.formInvalid || this.noServices) return;

    let data = this.offer;
    if (typeof data['price'] === 'string') {
      if (data['price'][0] === '$') data['price'] = data['price'].substr(1);
      data['price'] = parseInt(data['price'].replace(/,/g, ''));
    }

    let serviceRadius: any = this.offer.fulfillmentMethod.localServiceRadius;
    let localRadiusVal = typeof serviceRadius === 'string'
      ? parseInt(serviceRadius.substr(0, serviceRadius.length - 6), 10)
      : serviceRadius;

    data['fulfillmentMethod']['localServiceRadius'] = localRadiusVal;

    if (data['fulfillmentMethod']['shipment']) {
      if (typeof this.shipping['state'] === 'object') {
        let val = this.shipping['address']['state']['value'];

        data['address'] = this.shipping['address'];
        data['address']['state'] = val;
        data['parcel'] = this.shipping['parcel'];
      } else {
        data['address'] = this.shipping['address'];
        data['parcel'] = this.shipping['parcel'];
      }
    }

    // this.offerService.updateCustomOffer(data, this.id)
    //   .first()
    //   .subscribe(res => {
    //     console.log('create/update offer', res);
    //     if (res['success']) {
    //
    //       let offerId = res['offer'] ? res['offer']['_id'] : this.id;

          this.offerService.sendCustomOffer(this.linkedJobId, data)
            .first()
            .subscribe(response => {
              if (response['success']) {
                const modalRef = this.modalService.open(JobDetailModalComponent);
                modalRef.componentInstance.offerToEdit = data;
                modalRef.componentInstance.id = this.linkedJobId;
                // modalRef.componentInstance.offerToEditId = offerId;

                modalRef.componentInstance.editOfferEnabled = true;
                this.closeModal();
              }
            })
      //   }
      // })
  }

  closeModal() {
    this.activeModal.close();
  }

  preventClick = () => {

  }

  validateForm = () => {
    if (!this.allowValidation) return;
    let formHasBadFields = false;
    Object.keys(this.offer).map(key => {
      if (
        key !== 'sellerId'
        && key !== 'fulfillmentMethod'
        && key !== 'buyerId'
        && key !== 'serviceId'
      ) {
          if (!this.offer[key]) formHasBadFields = true;
      }
      if (key === 'fulfillmentMethod') {
        let invalid = true;
        Object.keys(this.offer.fulfillmentMethod).map(key => {
          if (key !== 'localServiceRadius' && key !== 'localServiceRadiusUom') {
            if (this.offer.fulfillmentMethod[key]) invalid = false;
          }
          if (key === 'local' && this.offer.fulfillmentMethod[key]) {
            let serviceRadius: any = this.offer.fulfillmentMethod.localServiceRadius;
            let localRadiusVal = typeof serviceRadius === 'string'
              ? parseInt(serviceRadius.substr(0, serviceRadius.length - 6), 10)
              : serviceRadius;

            if (!localRadiusVal) formHasBadFields = true;
          }
          if (key === 'shipment' && this.offer.fulfillmentMethod[key]) {
            let addressKeys = Object.keys(this.shipping.address);
            let parcelKeys = Object.keys(this.shipping.parcel);

            let invalidShipping = false;
            for (let i = 0; i < addressKeys.length; i++) {
              if (addressKeys[i] === 'street2') continue;
              // console.log('VALIDATE SHIPPING', this.shipping['address'][addressKeys[i]])
              if (!this.shipping['address'][addressKeys[i]]) {

                invalidShipping = true;
                break;
              }

            }
            //if (!invalidShipping) {
              for (let i = 0; i < parcelKeys.length; i++) {
              // console.log('VALIDATE PARCEL', this.shipping['address'][addressKeys[i]], parcelKeys[i])
                if (!this.shipping['parcel'][parcelKeys[i]]) {
                  invalidShipping = true;
                  break;
                }
              }
            //}

            if (invalidShipping) {
              formHasBadFields = true;
            }
          }

        })
        if (invalid) formHasBadFields = true;
      }

    });

    if (formHasBadFields) this.formInvalid = true;
    else this.formInvalid = false;
    return this.formInvalid;
  }


  parseInt(number) {
    return parseInt(number, 10);
  }

  getDistance(coordinates1) {
    if (!this.user.location || !this.user.location.geoJson) return '0km';
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


}
