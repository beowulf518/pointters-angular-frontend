import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BraintreeService } from '../../services/braintree.service';
import { ShipingAddressService } from '../../services/shiping-address.service';
import { ServiceService } from "./../../services/service.service";
import { OfferService } from "./../../services/offer.service";
import { UserService } from "../../services/user.service";
import { OrderService } from "../../services/order.service";

import { User } from "../../interfaces/user";
import { countries } from '../../interfaces/countries';
import { ToastrService } from "ngx-toastr";
import { GeolocationService } from '../../services/geolocation.service';

var braintree = require('braintree-web');
let paypal = window['PAYPAL'];
let paypalSubmitTokenize, cardSubmitTokenize;

let regex = {
  expr: /^(0[1-9]|1[012])[ -\/]\d\d$/,
  card: /(\d{4}[-.\s]?){4}|\d{4}[-.\s]?\d{6}[-.\s]?\d{5}/,
  cvv: /\d{3,4}/
}
@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  //-----------Shipping Address----------------
  private countries: any = countries;
  private btClientToken: any;
  private checkOutData: any = {};
  private shipingFrom: any = false;
  private confirmationOrderProccess: any = false;
  public user: User;
  private recalculatingShiping: any = false;
  private subtotalBuyAmount: any = 0;
  private transactionFee: any = false;
  private transactionTax: any = false;
  private transationErrorMessage: any = "";
  private totalBuyAmount: any = 0;
  private isSavingShip: any = false;
  private isEmptyOrder: any = true;
  private isDeletingShip: any = false;
  private deletingShip: any = {};
  private shipingList: any = [];
  private shipingListError: any = [];
  private selectedShiping: string = '';
  private selectedShipingID: string = '';
  private selectedShipingRate: any = false;
  private errors: any = {}
  private errorsEdit: any = {}
  private errorServer: any = []
  private shipingRates: any = false;
  private shiping: any = {
    name: '',
    street1: '',
    street2: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    phone: '',
  };
  private edit: any = {
    shiping: {},
    isEditProccess: false,
    data: {
      name: '',
      street1: '',
      street2: '',
      city: '',
      state: '',
      zip: '',
      country: '',
      phone: '',
    }
  };
  private editPayment: any = {
    card: {},
    editingToken: '',
    isEditProccess: false,
    data: {
      cardholderName: '',
      number: '',
      expr_month: '',
      expr_year: '',
      cvv: ''
    }
  };
  //Payment Method
  private paymentMethods: any = [];
  ShippingMethodShow: boolean = false;
  subtotalTimeAmount: number=0;
  relatedServices: any;

  public orderItems = [];
  constructor(
    private BraintreeService: BraintreeService,
    private ShipingAddressService: ShipingAddressService,
    private OfferService: OfferService,
    private toastr: ToastrService,
    private geoService: GeolocationService,
    private serviceService: ServiceService,
    private userService: UserService,
    private OrderService: OrderService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }
  //------------------------------------------------------------Pop up controll ----------------------
  openConfirmPopup() {
    let $ = window['$'];
    $('#confirm_popup').fadeIn(200);
  }
  closeConfirmPopup() {
    let $ = window['$'];
    $('#confirm_popup').fadeOut(200);
  }
  openErrorPopup() {
    let $ = window['$'];
    $('#error_popup').fadeIn(200);
  }
  closeErrorPopup() {
    let $ = window['$'];
    $('#error_popup').fadeOut(200);
  }
  //------------------------------------------------------------------Payment Methods-----------------
  editInit(card) {
    this.editReset();
    this.editPayment.card = card;
    this.editPayment.data.cardholderName = card.cardholderName;
    this.editPayment.data.number = "";
    this.editPayment.data.expr_month = card.expirationMonth
    this.editPayment.data.expr_year = card.expirationYear
    this.editPayment.data.cvv = "";
    this.editPayment.editingToken = card.token;
  }
  editReset() {
    this.editPayment.data.cardholderName = "";
    this.editPayment.data.number = "";
    this.editPayment.data.expr_month = "";
    this.editPayment.data.expr_year = "";
    this.editPayment.data.cvv = "";
    this.editPayment.editingToken = "";
    this.editPayment.isEditProccess = false;
    this.errorsEdit = {};
  }
  //Technical functions
  updateCardList() {
    this.BraintreeService.getPaymentMethod()
      .subscribe(res => {
        this.editReset()
        this.paymentMethods = res;
        this.paymentMethods = this.paymentMethods.map(element => {
          element['isDeleting'] = false;
          return element;
        });
      })
  }
  //-------------------------------------------------------------------Checkout------------------------
  confirmOrder() {
    if (this.confirmationOrderProccess) return;
    this.confirmationOrderProccess = true;

    if (this.checkOutData['service']) {
      var slug = 'service';
    } else if (this.checkOutData['customeOffer']) {
      var slug = 'customeOffer';
    }

    if (slug == 'service') {
      this.orderItems = this.checkOutData[slug].object.prices.map((element, index) => {
        element['quantity'] = this.checkOutData[slug].buyCount[index];
        return element;
      })
    } else if (slug == 'customeOffer') {
        let orderDetail: any = {};
        orderDetail.currencyCode = this.checkOutData[slug].object.currencyCode
        orderDetail.currencySymbol = this.checkOutData[slug].object.currencySymbol
        orderDetail.description = this.checkOutData[slug].object.description
        orderDetail.price = this.checkOutData[slug].object.price
        orderDetail.quantity = this.checkOutData[slug].buyCount
        orderDetail.time = this.checkOutData[slug].object.workDuration
        orderDetail.timeUnitOfMeasure = this.checkOutData[slug].object.workDurationUom
        orderDetail._id = this.checkOutData[slug].object._id

        this.orderItems.push(orderDetail);
        console.log(orderDetail);
        console.log(this.checkOutData[slug].buyCount);
    }

    let constructingOrder = {
      "paymentMethodToken": this.editPayment.card.token,
      "buyerId": this.user._id,
      "category": this.checkOutData[slug].object.category,
      "serviceId": this.checkOutData['service'] ? this.checkOutData['service'].object.id : this.checkOutData['customeOffer'].object.serviceId,
      "currencyCode": "USD",
      "currencySymbol": "$",
      "totalAmount": this.totalBuyAmount,
      "orderItems": this.orderItems,
      "paymentMethod": {
        "method": this.editPayment.card.cardType
      },
      "servicesPrices": this.checkOutData[slug].object.prices,
      "sellerId": this.checkOutData['service'] ? this.checkOutData['service'].seller.userId : this.checkOutData['customeOffer'].object.sellerId
    }
    // If selected shipment address add this and carrier to order object
    if (this.selectedShiping && this.selectedShipingRate) {
      let shipToAddress, shipToRate;
      shipToRate = this.selectedShipingRate;
      this.shipingList.map(element => {
        if (element.id == this.selectedShiping) {
          shipToAddress = {
            "_id": element.id,
            "externalId": element.externalId,
            "name": element.name,
            "street1": element.street1,
            "street2": element.street2 || 'null',
            "city": element.city,
            "state": element.state,
            "zip": element.zip,
            "country": element.country,
            "phone": element.phone

          }
        }
      })
      constructingOrder['buyerServiceLocation'] = shipToAddress;
      constructingOrder['shipmentId'] = this.selectedShipingID;
      let totalWorkDurationHours, hourMultiplier;
      let orderItems = this.checkOutData[slug].object.prices.map((element, index) => {
        // getting multiplier to get total HOURS
        if (element.timeUnitOfMeasure == "hour") { hourMultiplier = 1; }
        else if (element.timeUnitOfMeasure = "day") { hourMultiplier = 24; }
        else if (element.timeUnitOfMeasure = "week") { hourMultiplier = 168; }
        let a = this.checkOutData[slug].buyCount[index]
        totalWorkDurationHours += a * hourMultiplier * element.time;
      })
      constructingOrder['totalWorkDurationHours'] = totalWorkDurationHours;
      let address_str = shipToAddress.street1 + " " + shipToAddress.city + " " + shipToAddress.state + " " + shipToAddress.zip + " " + shipToAddress.country
      let geoJson = { "type": "Point", "coordinates": [] }
      this.geoService.getGeoAddress(address_str)
        .then(
          res => {
            geoJson.coordinates = [res.results[0].geometry.location.lng, res.results[0].geometry.location.lat]
            shipToAddress['geoJson'] = geoJson;
            this.ShipingAddressService.updateShipmentRate(this.selectedShipingID, { 'selectedRate': shipToRate })
              .subscribe(
                res => {
                  this.OrderService.postOrder(constructingOrder)
                    .subscribe(
                      res => {
                        this.confirmationOrderProccess = false;
                        this.router.navigateByUrl('/order/' + res['order']._id);
                        console.log('this.OrderService.postOrder', res)
                      }, err => {
                        this.confirmationOrderProccess = false;
                        this.transationErrorMessage = err.error.message;
                        this.closeConfirmPopup()
                        this.openErrorPopup()
                        console.log('this.OrderService.postOrder', err)
                      })
                })
          }
        )
      return;
    }
    let totalWorkDurationHours = 0, hourMultiplier;

    if (slug == 'service') {
      this.checkOutData[slug].object.prices.map((element, index) => {
        // getting multiplier to get total HOURS
        if (element.timeUnitOfMeasure == "hour") { hourMultiplier = 1; }
        else if (element.timeUnitOfMeasure = "day") { hourMultiplier = 24; }
        else if (element.timeUnitOfMeasure = "week") { hourMultiplier = 168; }
        let a = this.checkOutData[slug].buyCount[index]
        console.log(a)
        totalWorkDurationHours += a * hourMultiplier * element.time;
      })
    } else if (slug == 'customeOffer') {
      if (this.checkOutData.customeOffer.object.workDurationUom == "hour") { hourMultiplier = 1; }
      else if (this.checkOutData.customeOffer.object.workDurationUom = "day") { hourMultiplier = 24; }
      else if (this.checkOutData.customeOffer.object.workDurationUom = "week") { hourMultiplier = 168; }
      totalWorkDurationHours += this.checkOutData.customeOffer.buyCount * hourMultiplier * this.checkOutData.customeOffer.object.workDuration;
    }
    constructingOrder['totalWorkDurationHours'] = totalWorkDurationHours;
    // constructingOrder['fulfillmentMethod'] = this.checkOutData.service.object;
    // constructingOrder['transactionFee'] = this.transactionFee.transactionFee;
    this.OrderService.postOrder(constructingOrder)
      .subscribe(
        res => {
          this.confirmationOrderProccess = false;
          this.router.navigateByUrl('/order/' + res['order']._id);
          console.log('this.OrderService.postOrder', res)
        }, err => {
          this.confirmationOrderProccess = false;
          this.transationErrorMessage = err.error.message;
          this.closeConfirmPopup()
          this.openErrorPopup()
          console.log('this.OrderService.postOrder', err)
          console.log(constructingOrder)
        })
  }
  onChangeBuyCount(mode, i) {
    if (this.checkOutData['service']) {
      if (mode == 'up') {
        this.checkOutData.service.buyCount[i]++;
        console.log('UP')
        console.log(this.subtotalTimeAmount)
      } else {
        if (this.checkOutData.service.buyCount[i] > 0) {
          this.checkOutData.service.buyCount[i]--;
        }
      }
    } else {
      if (this.checkOutData['customeOffer']) {
        if (mode == 'up') {
          this.checkOutData.customeOffer.buyCount++
          console.log('UP')
          console.log(this.subtotalTimeAmount)
        } else {
          if (this.checkOutData.customeOffer.buyCount > 0) {
            this.checkOutData.customeOffer.buyCount--;
            console.log(this.subtotalTimeAmount)
          }
        }
      }
    }
    this.recalculateTotalPrice();
  }


  recalculateTotalPrice(){

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
      this.subtotalBuyAmount = 0;
      this.subtotalTimeAmount = 0;

      // getting multiplier to get total HOURS
      if (this.checkOutData.customeOffer.object.workDurationUom == "hour") { hourMultiplier = 1; }
      else if (this.checkOutData.customeOffer.object.workDurationUom = "day") { hourMultiplier = 24; }
      else if (this.checkOutData.customeOffer.object.workDurationUom = "week") { hourMultiplier = 168; }

      // this.subtotalTimeAmount += this.checkOutData.customeOffer.buyCount * hourMultiplier * this.checkOutData.customeOffer.object.time;
      this.subtotalTimeAmount += this.checkOutData.customeOffer.buyCount * hourMultiplier * this.checkOutData.customeOffer.object.workDuration;
      this.subtotalBuyAmount = this.checkOutData.customeOffer.object.price * this.checkOutData.customeOffer.buyCount;

      this.subtotalBuyAmount == 0 ? this.isEmptyOrder = true : this.isEmptyOrder = false;
      this.getTaxesTreansactionFee(this.subtotalBuyAmount, this.checkOutData.customeOffer.object.currencyCode, this.checkOutData.customeOffer.object.serviceId)
    }
  }
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
          this.transactionTax = res[0]
          this.transactionFee = res[1]
          this.totalBuyAmount = (this.subtotalBuyAmount + this.transactionFee.transactionFee + this.transactionTax.taxAmount + (+this.selectedShipingRate.rate || 0)).toFixed(2);
          // console.log(this.transactionFee)
        }
      )
  }
  //--------------------------------------------------------------------------------------Shipping Address----------------
  saveShip() {
    if (this.isSavingShip) return;
    this.errors = {};
    if (this.validation(this.shiping, this.errors)) {
      this.isSavingShip = true;
      this.addShip()
    }
  }
  editUpdateShip() {
    if (this.edit.isEditProccess) return;
    this.errorsEdit = {};
    if (this.validation(this.edit.data, this.errorsEdit)) {
      this.edit.isEditProccess = true;
      this.updateShip();
    }
  }
  addShip() {
    this.ShipingAddressService.addShipingAddress(this.shiping)
      .subscribe(
        res => {
          this.updateShipingList();
        },
        err => {
          this.toastr.error(err.error.message, 'Error adding shiping address');
          this.isSavingShip = false;
        }
      )
  }
  updateShip() {
    this.ShipingAddressService.updateShipingAddress(this.edit.shiping.id, this.edit.data)
      .subscribe(
        res => {
          this.edit.isEditProccess = false;
          this.updateShipingList();
        },
        err => {
          this.toastr.error(err.error.message, 'Error editing shiping address');
          this.edit.isEditProccess = false;
        }
      )
  }
  modalAccept() {
    this.deletingShip.isDeleting = true;
    this.ShipingAddressService.deleteShipingAddress(this.deletingShip.id)
      .subscribe(res => {
        this.updateShipingList();
      })
  }
  selectChanged(target, evnt) {

    this[target] = evnt;
    console.log(target, this.edit);
  }
  selectShiping(object) {
    this.selectedShiping = object.id;
    this.edit.shiping = object;
    this.edit.data = {
      name: object.name,
      street1: object.street1,
      street2: object.street2,
      city: object.city,
      state: object.state,
      zip: object.zip,
      country: object.country,
      phone: object.phone,
    }
    this.recalculateShipingAddress();
  }
  resetShiping() {
    this.shipingRates = false;
    this.selectedShipingRate = false;
    this.isSavingShip = false;
    this.isDeletingShip = false;
    this.selectedShiping = "";
    this.shipingListError = [];
    this.errorServer = [];
    this.errors = {}
    this.errorsEdit = {}
    this.shiping = {
      name: '', street1: '', street2: '', city: '',
      state: '', zip: '', country: '', phone: ''
    };
    this.edit = {
      shiping: {},
      isEditProccess: false,
      data: {
        name: '', street1: '', street2: '', city: '',
        state: '', zip: '', country: '', phone: ''
      }
    };
  }
  updateShipingList() {
    this.ShipingAddressService.getShipingAddress()
      .subscribe(
        res => {
          this.shipingList = res['docs'].map(element => {
            element.id = element._id;
            return element;
          });
          this.resetShiping()
        },
        err => {
          this.shipingList = [];
          this.errorServer = [{ 'message': err.error['message'] }]
        }
      )
  }
  recalculateShipingAddress() {
    this.shipingRates = false;
    this.selectedShipingRate = false;
    this.recalculatingShiping = true;
    let shipToAddress;
    this.shipingList.map(element => {
      if (element.id == this.selectedShiping) {
        shipToAddress = {
          "_id": element.id,
          "externalId": element.externalId,
          "name": element.name,
          "street1": element.street1,
          "street2": element.street2,
          "city": element.city,
          "state": element.state,
          "zip": element.zip,
          "country": element.country,
          "phone": element.phone

        }
      }
    })
    let payload = {
      toAddress: shipToAddress,
      fromAddress: this.shipingFrom.address,
      parcel: this.shipingFrom.parcel,

    }
    this.ShipingAddressService.placeShipingAddress(payload)
      .subscribe(
        res => {
          console.log(`RES, ${res}`)
          console.log('this.ShipingAddressService.placeShipingAddress request', res)
          console.log('this.ShipingAddressService.placeShipingAddress response', res)
          this.selectedShipingID = res['shipmentSaved']._id;
          this.ShipingAddressService.getShipingInfo(res['shipmentSaved']._id)
            .subscribe(res => {
              console.log('this.ShipingAddressService.getShipingInfo ', res)
              this.shipingRates = res['rates'];
              if (this.shipingRates.length == 0) {
                this.toastr.error('There is no any shipment option available. Try to change shipment address', ' placeShipingAddress err ')
                return;
              }
            }, err => {
              console.log('this.ShipingAddressService.getShipingInfo ', err)
            })
        },
        err => {
          this.toastr.error(err.error['message'], ' placeShipingAddress err ')
          console.log('this.ShipingAddressService.placeShipingAddress err ', err)
        }
      )
  }
  validation(source, error) {
    if (!source.name) {
      error['name'] = [{ message: 'This field required' }]; return false;
    }
    if (!source.street1) {
      error['street1'] = [{ message: 'This field required' }]; return false;
    }
    // if (!source.street2) {
    //   error['street2'] = [{ message: 'This field required' }]; return false;
    // }
    if (!source.city) {
      error['city'] = [{ message: 'This field required' }]; return false;
    }
    if (!source.state) {
      error['state'] = [{ message: 'This field required' }]; return false;
    }
    if (!source.zip) {
      error['zip'] = [{ message: 'This field required' }]; return false;
    }
    if (!source.country) {
      error['country'] = [{ message: 'This field required' }]; return false;
    }
    return true;
  }

  ngOnInit() {

    this.userService.user.subscribe(user => {
      console.log('user', user)
      this.user = user;
    });

    this.checkOutData = this.serviceService.checkOutData;
    console.log('this.checkOutData', this.checkOutData)
    this.recalculateTotalPrice();
    this.updateShipingList();
    this.updateCardList();

    if (this.checkOutData['service'] && this.checkOutData['service'].object.fulfillmentMethod.shipment) {
      this.ShippingMethodShow = true;
      this.shipingFrom = {
        address: this.checkOutData['service'].object.fulfillmentMethod.address,
        parcel: this.checkOutData['service'].object.fulfillmentMethod.parcel
      }
    } else if (this.checkOutData['customeOffer'] && this.checkOutData['customeOffer'].object.fulfillmentMethod.shipment) {
      this.ShippingMethodShow = true;
      this.shipingFrom = {
        address: this.checkOutData['customeOffer'].object.fulfillmentMethod.address,
        parcel: this.checkOutData['customeOffer'].object.fulfillmentMethod.parcel
      }
    }
  }


}

