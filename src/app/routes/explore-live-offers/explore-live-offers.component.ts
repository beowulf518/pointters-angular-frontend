// import { Component, OnInit, Input, OnChanges, ViewChild } from '@angular/core';
import {
  Component,
  Input,
  Output,
  SimpleChange,
  OnChanges,
  OnInit,
  DoCheck,
  AfterContentInit,
  AfterContentChecked,
  AfterViewInit,
  AfterViewChecked,
  OnDestroy,
  EventEmitter, ViewChild
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import mapStyle from './../../interfaces/map-style';
import { UserService } from './../../services/user.service';
import { ExploreLiveOffersService } from './../../services/explore-live-offers.service';
import { RequestService } from './../../services/request.service';

import { GoogleMapsAPIWrapper, LatLngBounds } from '@agm/core';

import { Paginated } from './../../interfaces/paginated';
import { User } from './../../interfaces/user';
import { Request } from './../../interfaces/request';
import { As3Service } from '../../services/as3.service';
import { OrderService } from '../../services/order.service';
import { ToastrService } from 'ngx-toastr';
import { Http } from '@angular/http';

import { DateTime } from 'luxon';
import { GeolocationService } from '../../services/geolocation.service';
import { lifeOffersSocketService } from '../../services/lifeOffersRequest.service';
import { ServiceService } from '../../services/service.service';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap/modal/modal';

import { SwiperConfigInterface,
  SwiperScrollbarInterface, SwiperPaginationInterface } from 'ngx-swiper-wrapper';
import { OrderPipe } from 'ngx-order-pipe';
let moment = require('moment');
declare var $: any;

var ta = require('time-ago')  // node.js

/*let testData = [
    {
      label: 'test suggestion 1', value: 'test'
    },
    {
      label: 'test suggestion 2', value: 'test'
    },
    {
      label: 'test suggestion 3', value: 'test'
    },
    {
      label: 'test suggestion 4', value: 'test'
    },
    {
      label: 'test suggestion 5', value: 'test'
    }
];*/
const uuid = require('uuid/v4');

@Component({
  selector: 'app-explore-live-offers',
  templateUrl: './explore-live-offers.component.html',
  styleUrls: ['./explore-live-offers.component.css']
})

export class ExploreLiveOffersComponent implements OnInit, OnChanges {

  private model: any;
  private medias = [];

  public config: SwiperConfigInterface = {
    a11y: true,
    direction: 'horizontal',
    slidesPerView: 3,
    spaceBetween: 20,
    navigation: true,
    keyboard: true,
    mousewheel: true
  };

  private isLoading = false;
  private orderComplete = false;
  private isSeller = false;

  private orderId: any = '';
  private serviceType: any = '';
  private serviceCompleteCheck: any = {
    'local': () => { this.isSeller ? this.orderComplete = true : this.orderComplete = false; },
    'store': () => { this.isSeller ? this.orderComplete = true : this.orderComplete = false; },
    'online': () => { console.log('Check, ', this.upFiles); this.isSeller && this.upFiles.length ? this.orderComplete = true : this.orderComplete = false; },
    'shipment': () => { this.isSeller ? this.orderComplete = true : this.orderComplete = false; }
  };

  @ViewChild('map') mapView;

  private selectedIncomingItem: any;
  private selectedSuggestedItem: any;
  public overlays: object = {};
  private fetching: boolean = true;
  private data: any;


// Files Upload
  private upFiles: any = [];
  constructor(
    private geoService: GeolocationService,
    private modalService: NgbModal,
    private serviceService: ServiceService,
    private route: ActivatedRoute,
    private router: Router,
    private geolocation: GeolocationService,
    private http: Http,
    private toastr: ToastrService,
    private as3Service: As3Service,
    private orderService: OrderService,
    private userService: UserService,
    private requestService: RequestService,
    private offersService: ExploreLiveOffersService,
    private lifeOffersSocketService:lifeOffersSocketService,

  ) { }

  @Input() private requestId: string;

  private createRequestOpen: boolean = false;
  private searchHelperOpen: boolean = false;
  private mapStyle: any = mapStyle;
  private request: any;
  private datePickerOpen: boolean = false;
  private timePickerOpen: boolean = false;
  private date: any = new Date();

  // private recentOffers = testData;
  // private recentCategories = testData;
  // private searchSuggestions = testData;
  private suggestionMode: boolean = false;

  private user: User;

  private blockClickOutside: boolean = true;

  private categories: any = [];
  private categoriesTransfer: any = [];
  private addMethod_opened: boolean = false;
  private category = -1;
  private error = "";

  private moment: any = moment;
  private toTime: number;
  private fromTime: number;
  private displayTime: string;
  private displayDate = new Date();
  // public localTime;

  private requestImageErr: boolean = false;
  private suggestedOffers: Paginated;
  public incomingOffers;
  public incomingOffersAddress;
  public incomingAndSuggestedOffers = [];

  private locationStr;

  private id;
  public num:number;
  public page:number;

  public requestBody: any = {
    description: "",
    minPrice: "",
    maxPrice: "",
    location: {
      "city": "",
      "country": "",
      "geoJson": {
          "type": "Point",
          "coordinates": [
              -73.856077,
              40.848447
          ]
      },
      "postalCode": "",
      "province": "",
      "state": ""
    },
    category: [],
    media: [],
    currencyCode: '$',
    currencySymbol: 'USD',
    scheduleDate: new Date(),
  }

  public componentData: any = '';

  public userSettings: any = {
    showRecentSearch: false,
    showSearchButton: false,
    // inputString: `${this.locationStr}`,
    inputPlaceholderText: 'Type Location',
    geoTypes: ['(regions)', '(cities), \'establishment\', \'geocode\''],
    currentLocIconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAANCAYAAACZ3F9/AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAHPSURBVChTbVI9TxtBEH0+n80lWDSxQTIfFgGlSATUdFEEXWo6FFEkootC+AsUiUJDSYFQClJRIChAYCkSQkTQGQchUKIgSEThGPn8wXG3t8PMEj4MedLe7s68t3vzdiLEwH/w+ThAhOfhtthl4A7uCYs+IVtQmPzpm/344zieJ20k43LMDeqEm0WFd7se/rL4WSJqYt8rIRLRCD4+dTCYsk3MQISC7VNF6RWX3ufP6Fc1JK3JDFmPcUxywrmCuVGuHNisotWxMNPnYLeiMX3oo6XBwqv2GNINEbzNe9iraqz1N5ra4SlN+5WQYkslMxfONWVWXcJiyYzer2UqBZoObnFEYy2cKLzcquGBBXQ/tPDtVOHQu/ErV9bYKIbo4pxwhCsaq7fJwgj/zrkGD0I7Z2O3DGQumtlRj3PCEa5ojDleqKl52aX5P74x5MOBR51rLqXYkLGdGikOzh37lGKOcI0t5suY2PfoSdalnZK6djPvKgp4k+NYB9ctnCtcv2NVEd7kzrDO9bzuiGMgGYUksoUQM0c+XjyyMdXjoJHfVFDXAGUWf/kdYPYowI8aF8QQU0YzcQylbTj/RIJ7LSeo8AHj3EGCT9wxCbu+3QDgAopkTBqRVW1CAAAAAElFTkSuQmCC'
  };

  public currentLocation;

  // Start sort incoming offers
  order: string = 'id';
  reverse: boolean = false;

  public bounds: LatLngBounds;
  public currentBounds;
  private updatingMap: boolean = false;


  ngOnInit() {

    this.loadSuggestedOffers();

    this.route.params.subscribe(params => {
      // console.log(params) //log the entire params object
      this.id = params['id'];
      this.lifeOffersSocketService.initSocket();
    });

    this.getCategory();

    if (this.id) {

      this.loadRequestOffers();
      // this.userSettings.inputString = "'" + this.locationStr + "'";
      this.createRequestOpen = true;
      this.requestService.get(this.id)
        .subscribe(
          res => {
            console.log(res);
            this.requestBody = res;
            this.medias = this.requestBody.media

            this.displayDate = this.requestBody.scheduleDate;
            this.displayTime = this.requestBody.scheduleDate;

            if (this.requestBody.category.score) {
              this.onCategory(this.requestBody.category.score);
            }

            this.lifeOffersSocketService.addJoinLiveOfferRoomListener()
              .subscribe(data => {
              console.log('addJoinLiveOfferRoomListener', data);
            })
            this.lifeOffersSocketService.addLiveOfferErrorListener()
              .subscribe(data => {
              console.log('addLiveOfferErrorListener', data);
            })
            this.lifeOffersSocketService.addliveOfferListener()
              .subscribe(data => {
              console.log('addliveOfferListener', data);
            })
            this.lifeOffersSocketService.joinLiveOfferRoom(this.id);

            let myStr = [];
            let location = this.requestBody.location;

            if(location && location.hasOwnProperty('city'))
              myStr.push(location.city);
            if(location && location.hasOwnProperty('province') && location.province !== 'NA')
              myStr.push(location.province);
            if(location && location.hasOwnProperty('country'))
              myStr.push(location.country);
            if(location && location.hasOwnProperty('postalCode'))
              myStr.push(location.postalCode);

            this.locationStr = myStr.join(', ');

            this.userSettings.inputString = `${this.locationStr}`;
            let inputSearch = <HTMLInputElement>document.getElementById('search_places');
            inputSearch.value = this.locationStr;
          },
          err => {console.log(err)}
        );
        this.userSettings['inputString'] = `${this.locationStr}`;
    }
    this.userService.user.subscribe(data => {
      if (data) {
        this.user = data;
        console.log(this.user)
      }
    });

    // Let to type only numbers
    $(document).ready(function () {
      $('#input-max-price,#priceFocus').keypress(function (key) {
        if (!(key.charCode < 97 || key.charCode > 122) && (key.charCode < 65 || key.charCode > 90) && (key.charCode != 45) && (key.charCode != 32) && (key.charCode != 0)  ) return false;
      });
    });
  }


  ngOnChanges(changes) {

     if (changes.requestId && changes.requestId.currentValue) {
      this.requestService.get(changes.requestId.currentValue)
        .first()
        .subscribe(
          (res: Request) => {
            this.request = res;
          },
          (err) => {
            console.log('failed to fetch request by id', changes.requestId.currentValue);
          }
        );
    }
  }

  onOpenMethod() {
    this.addMethod_opened = !this.addMethod_opened;
    // this.addPrice_opened = false;
  }

  getCategory() {
    this.serviceService.getCategories().subscribe(
(res: { categories: any[] }) => {
      let categoriesAll = res.categories;
      let i = 1;
      categoriesAll.forEach(element => {
        i++;
        this.categories.push({
          id: element._id,
          name: element.name,
          sub: false
        });
        this.categoriesTransfer.push({ id: element._id, name: element.name });
        if (element.subCategories.length > 0) {
          element.subCategories.forEach(subElement => {
            this.categories.push({
              id: subElement._id,
              name: subElement.name,
              sub: true
            });
            this.categoriesTransfer.push({
              id: subElement._id,
              name: subElement.name
            });
          });
        }
      });
    });
  }

  onOpenCategory() {
    this.addMethod_opened = false;
    // this.addPrice_opened = false;
  }

  onCategory(index) {
    this.category = index;
    this.categories[index].score = index;
    // console.log(this.categories[index]);
    this.requestBody.category = this.categories[index];
  }
  onSave() {
    if (this.category == 0) {
      this.error = "Please select category.";
      return;
    }
  }

  handleImageErr() {
    this.requestImageErr = true;
  }

  handleSuggestion(item) {
    this.requestBody.description = item.label;
    this.suggestionMode = false;
    this.searchHelperOpen = false;
  }

  clickOutsideSearch() {
    this.searchHelperOpen = false;
    this.suggestionMode = false;
  }

  handleRequestSearchInput(val) {
    if (val) {
      this.suggestionMode = true;
    } else {
      this.suggestionMode = false;
    }
  }

  handleSearchInputClick = () => {
    if (this.createRequestOpen) {
      this.searchHelperOpen = true;
    } else {
      this.createRequestOpen = true;
    }
  }

  toggleCreateRequest = (val: boolean) => {
    this.createRequestOpen = val;
  }

  toggleDatePicker(val: boolean) {
    this.datePickerOpen = val;
  }

  focusOnSchedule() {
    this.createRequestOpen = true;
    setTimeout(function() {
      let datePicker = document.getElementsByClassName('ngx-datepicker-input')[0] as HTMLElement;
      datePicker.click();
    }, 100);
  }

  focusOnPrice() {
    this.createRequestOpen = true;
    setTimeout(function() {
      document.getElementById('priceFocus').focus();
    }, 100);
  }

  focusOnLocation() {
    this.createRequestOpen = true;
    setTimeout(function() {
      document.getElementById('search_places').focus();
    }, 100);
  }

  autoCompleteCallback(res: any): any {
    this.componentData = JSON.stringify(res);
    let locationTemp= {}
    let str = [];
    console.log(res)

    res.data.address_components.map(function (location, index) {
      let typeArray = location.types;
      let typesStr = typeArray.includes("locality") ? 'locality' : typeArray.includes("administrative_area_level_1") ? 'administrative_area_level_1' : typeArray.includes("country") ? 'country' : typeArray.includes("postal_code") ? "postal_code" : '';
      // console.log(location.types)

      switch (typesStr) {

        case("locality"):
          locationTemp['city'] = location.long_name;
          str.push(location.long_name)
          break;

        case("administrative_area_level_1"):
          locationTemp['province'] = location.long_name;
          str.push(location.long_name)
          break;

        case("country"):
          locationTemp['country'] = location.long_name;
          str.push(location.long_name)
          break;

        case("postal_code"):
          locationTemp['postalCode'] = location.long_name;
          str.push(location.long_name)
          break;
      }
    });

    locationTemp['geoJson'] = {
      "type": "Point",
      "coordinates": [res.data.geometry.location.lng, res.data.geometry.location.lat]
    };
    this.locationStr = str.join(", ");
    console.log(locationTemp)
    // console.log(this.locationStr)
    this.currentLocation = locationTemp;
    this.requestBody.location = locationTemp;

    setTimeout(() => {
      this.userSettings['inputString'] = this.locationStr;
      this.userSettings = Object.assign({}, this.userSettings);
    }, 10);
  }

  onUploadMedia(event) {
    const files: FileList = event.target.files;
    if(files.length == 0) {
      return;
    }
    const medias = Array.from(files).map( (file, index, arr) => {
      return {
        file: file,
        fileName: uuid(),
        mediaType: file.type.split('/')[0],
      };
    });
    // setting loading indicator while uploading images
    this.isLoading = true;

    this.as3Service.uploadMedia(medias).subscribe(
      (res) => {
        this.medias = [ ...this.medias, ...medias.map( (media, index) => {
          return {
            mediaType: media.mediaType,
            fileName: res[index]['path'],
          };
        })];
        this.isLoading = false;
        this.requestBody.media = this.medias;
      });
  }

  onRemoveImageItem(index) {
    this.requestBody.media.splice(index, 1);
  }

  createRequest() {
    this.requestBody.location = this.currentLocation;

    let inputTime = document.querySelector('input#input-time') as HTMLInputElement;
    let inputTimeError = inputTime.parentNode.parentNode as HTMLElement;
    let inputLocation = document.querySelector('input#search_places') as HTMLInputElement;
    let inputLocationError = document.querySelector('.input-location-error') as HTMLInputElement;
    let minPrice = document.querySelector('#priceFocus') as HTMLInputElement;
    let maxPrice = document.querySelector('#input-max-price') as HTMLInputElement;
    let inputMinPrice = document.querySelector('#min-price') as HTMLElement;
    let inputMaxPrice = document.querySelector('#max-price') as HTMLElement;

    console.log(minPrice.value == '')
    console.log(maxPrice.value == '')
    console.log(minPrice.value > maxPrice.value )

    if (inputTime.value == '') {
      this.toastr.error('Time field is required.', 'Creating request failed');
      inputTimeError.style.cssText= 'border: 1px solid red';
      inputLocationError.style.cssText = 'border: 1px solid #e4e4e4';
      inputMinPrice.style.cssText = 'border: 1px solid red #e4e4e4';
      inputMaxPrice.style.cssText = 'border: 1px solid #e4e4e4';
    }
    else if (minPrice.value !== '' && maxPrice.value !== '' && maxPrice.value <= minPrice.value ) {
      this.toastr.error('Price field "From" should be smaller than "To".', 'Creating request failed');
      inputMinPrice.style.cssText = 'border: 1px solid red !important';
      inputMaxPrice.style.cssText = 'border: 1px solid red !important;';
      inputLocationError.style.cssText = 'border: 1px solid #e4e4e4 !important';
      inputTimeError.style.cssText = 'border: 1px solid #e4e4e4 !important;';
    }
    else if (inputLocation.value == '' ) {
      this.toastr.error('Location field is required.', 'Creating request failed');
      inputLocationError.style.cssText = 'border: 1px solid red';
      inputTimeError.style.cssText = 'border: 1px solid #e4e4e4 !important;';
      inputMinPrice.style.cssText = 'border: 1px solid #e4e4e4';
      inputMaxPrice.style.cssText = 'border: 1px solid #e4e4e4 !important;';
    }
    else {
      inputTimeError.style.cssText = 'border: 1px solid #e4e4e4 !important;';
      inputLocationError.style.cssText = 'border: 1px solid #e4e4e4 !important;';
      inputMinPrice.style.cssText = 'border: 1px solid #e4e4e4 !important';
      inputMaxPrice.style.cssText = 'border: 1px solid #e4e4e4 !important;';

      this.requestService.createRequest(this.requestBody)
        .subscribe((res: any) => {
          console.log('created request', res);
          this.toastr.success('Success!', 'Request created');
          this.router.navigate(['/explore/live-offers/' + res._id]);
          console.log(res._id)
          this.request = res;
          this.createRequestOpen = false;
        }, err => {
          console.log('error', err)

          let category = document.querySelectorAll('a[aria-expanded="false"')[2] as HTMLElement;
          let inputDescription = document.querySelector('.input-description') as HTMLElement;
          let inputMinPrice = document.querySelector('#min-price') as HTMLElement;
          let inputMaxPrice = document.querySelector('#max-price') as HTMLElement;

          switch (err.error.message) {
            case "category must be an object":
              this.toastr.error('Please, select a category.', 'Creating request failed');
              category.style.cssText = 'border: 1px solid red';
              inputDescription.style.cssText = 'border: none !important';
              inputMaxPrice.style.cssText = 'border: 1px solid #e4e4e4 !important;';
              inputMinPrice.style.cssText = 'border: 1px solid #e4e4e4 !important;';
              break;
            case "description is not allowed to be empty":
              this.toastr.error('Description is not allowed to be empty.', 'Creating request failed');
              inputDescription.style.cssText = 'border: 1px solid red !important';
              category.style.cssText = 'border: 1px solid #e4e4e4 !important;';
              inputMaxPrice.style.cssText = 'border: 1px solid #e4e4e4 !important;';
              inputMinPrice.style.cssText = 'border: 1px solid #e4e4e4 !important;';
              break;
            case "minPrice must be a number":
              this.toastr.error('Price field "From" is required.', 'Creating request failed');
              inputMinPrice.style.cssText = 'border: 1px solid red !important';
              // inputDescription.style.cssText = 'border: none !important';
              inputDescription.style.cssText = 'border: 1px solid #e4e4e4 !important;';
              category.style.cssText = 'border: 1px solid #e4e4e4 !important;';
              inputMaxPrice.style.cssText = 'border: 1px solid #e4e4e4 !important;';
              break;
            case "maxPrice must be a number":
              this.toastr.error('Price field "To" is required.', 'Creating request failed');
              inputMinPrice.style.cssText = 'border: 1px solid #e4e4e4 !important;';
              inputMaxPrice.style.cssText = 'border: 1px solid red !important';
              category.style.cssText = 'border: 1px solid #e4e4e4 !important;';
              inputDescription.style.cssText = 'border: 1px solid #e4e4e4 !important;';
              break;
            case "city is required":
              this.toastr.error('Location city is required.', 'Creating request failed');
              inputLocationError.style.cssText= 'border: 1px solid red';
              inputMinPrice.style.cssText = 'border: 1px solid #e4e4e4 !important;';
              inputMaxPrice.style.cssText = 'border: 1px solid #e4e4e4 !important';
              category.style.cssText = 'border: 1px solid #e4e4e4 !important;';
              inputDescription.style.cssText = 'border: 1px solid #e4e4e4 !important;';
              break;

            default:
              this.toastr.error('Unexpected error occurred.', 'Creating request failed');
          }
        });
    }
  }

  updateRequest() {
    let timeHH = moment(this.displayTime).format("HH");
    let timeMM = moment(this.displayTime).format("mm");

    let date = moment(this.displayDate);
    let resetTime = date.set('hour',0).set('minute', 0)
    console.log(resetTime)
    let fullDate = resetTime.add(timeHH,'hours').add(timeMM,'minutes');

    this.requestBody.scheduleDate = fullDate.utc().toISOString();
    this.requestBody.location = this.currentLocation;

    let inputTime = document.querySelector('input#input-time') as HTMLInputElement;
    let inputTimeError = inputTime.parentNode.parentNode as HTMLElement;
    let inputLocation = document.querySelector('input#search_places') as HTMLInputElement;
    let inputLocationError = document.querySelector('.input-location-error') as HTMLInputElement;
    let minPrice = document.querySelector('#priceFocus') as HTMLInputElement;
    let maxPrice = document.querySelector('#input-max-price') as HTMLInputElement;
    let inputMinPrice = document.querySelector('#min-price') as HTMLElement;
    let inputMaxPrice = document.querySelector('#max-price') as HTMLElement;

    console.log(minPrice.value == '')
    console.log(maxPrice.value == '')
    console.log(minPrice.value > maxPrice.value )

    if (inputTime.value == '') {
      this.toastr.error('Time field is required.', 'Creating request failed');
      inputTimeError.style.cssText= 'border: 1px solid red';
      inputLocationError.style.cssText = 'border: 1px solid #e4e4e4';
      inputMinPrice.style.cssText = 'border: 1px solid red #e4e4e4';
      inputMaxPrice.style.cssText = 'border: 1px solid #e4e4e4';
    }
    else if (minPrice.value !== '' && maxPrice.value !== '' && maxPrice.value <= minPrice.value ) {
      this.toastr.error('Price field "From" should be smaller than "To".', 'Creating request failed');
      inputMinPrice.style.cssText = 'border: 1px solid red !important';
      inputMaxPrice.style.cssText = 'border: 1px solid red !important;';
      inputLocationError.style.cssText = 'border: 1px solid #e4e4e4 !important';
      inputTimeError.style.cssText = 'border: 1px solid #e4e4e4 !important;';
    }
    else if (inputLocation.value == '' ) {
      this.toastr.error('Location field is required.', 'Creating request failed');
      inputLocationError.style.cssText = 'border: 1px solid red';
      inputTimeError.style.cssText = 'border: 1px solid #e4e4e4 !important;';
      inputMinPrice.style.cssText = 'border: 1px solid #e4e4e4';
      inputMaxPrice.style.cssText = 'border: 1px solid #e4e4e4 !important;';
    }
    else {
      inputTimeError.style.cssText = 'border: 1px solid #e4e4e4 !important;';
      inputLocationError.style.cssText = 'border: 1px solid #e4e4e4 !important;';
      inputMinPrice.style.cssText = 'border: 1px solid #e4e4e4 !important';
      inputMaxPrice.style.cssText = 'border: 1px solid #e4e4e4 !important;';



    this.requestService.updateRequest(this.requestBody, this.id)
      .subscribe((res: any) => {
        this.toastr.success('Success!', 'Request updated');
        console.log('created request', res);
        // this.createRequestOpen = false;
        this.requestBody = res;
        this.request = res;
      }, err => {
        console.log('error', err)

        let category =  document.querySelectorAll('a[aria-expanded="false"')[2] as HTMLElement;
        let inputDescription = document.querySelector('.input-description') as HTMLElement;
        let inputMinPrice = document.querySelector('#min-price') as HTMLElement;
        let inputMaxPrice = document.querySelector('#max-price') as HTMLElement;
        let inputLocationError = document.querySelector('.input-location-error') as HTMLInputElement;

        switch (err.error.message) {
          case "category must be an object":
            this.toastr.error('Please, select a category.', 'Creating request failed');
            category.style.cssText = 'border: 1px solid red';
            inputDescription.style.cssText = 'border: none !important';
            inputMaxPrice.style.cssText = 'border: 1px solid #e4e4e4 !important;';
            inputMinPrice.style.cssText = 'border: 1px solid #e4e4e4 !important;';
            break;
          case "description is not allowed to be empty":
            this.toastr.error('Description is not allowed to be empty.', 'Creating request failed');
            inputDescription.style.cssText = 'border: 1px solid red !important';
            category.style.cssText = 'border: 1px solid #e4e4e4 !important;';
            inputMaxPrice.style.cssText = 'border: 1px solid #e4e4e4 !important;';
            inputMinPrice.style.cssText = 'border: 1px solid #e4e4e4 !important;';
            break;
          case "minPrice must be a number":
            this.toastr.error('Price field "From" is required.', 'Creating request failed');
            inputMinPrice.style.cssText = 'border: 1px solid red !important';
            // inputDescription.style.cssText = 'border: none !important';
            inputDescription.style.cssText = 'border: 1px solid #e4e4e4 !important;';
            category.style.cssText = 'border: 1px solid #e4e4e4 !important;';
            inputMaxPrice.style.cssText = 'border: 1px solid #e4e4e4 !important;';
            break;
          case "maxPrice must be a number":
            this.toastr.error('Price field "To" is required.', 'Creating request failed');
            inputMinPrice.style.cssText = 'border: 1px solid #e4e4e4 !important;';
            inputMaxPrice.style.cssText = 'border: 1px solid red !important';
            category.style.cssText = 'border: 1px solid #e4e4e4 !important;';
            inputDescription.style.cssText = 'border: 1px solid #e4e4e4 !important;';
            break;
          case "city is required":
            this.toastr.error('Location city is required.', 'Creating request failed');
            inputLocationError.style.cssText= 'border: 1px solid red';
            inputMinPrice.style.cssText = 'border: 1px solid #e4e4e4 !important;';
            category.style.cssText = 'border: 1px solid #e4e4e4 !important;';
            inputDescription.style.cssText = 'border: 1px solid #e4e4e4 !important;';
            break;
          default:
            this.toastr.error('Unexpected error occurred.', 'Creating request failed');
        }
      });
    }
  }

  deleteRequest(){
    this.requestService.deleteRequest(this.id)
      .subscribe((res: any) => {
        console.log('Deleted', res);
        this.router.navigate(['/explore/live-offers'])
        this.toastr.success('Success!', 'Request deleted');
      }, err => {
        console.log(err);
      })
  }

  setOrder(value: string) {
    if (this.order === value) {
      this.reverse = !this.reverse;
    }
    this.order = value;
  }

  loadSuggestedOffers = () => {
    this.page = this.suggestedOffers ? (this.suggestedOffers.page + 1) : 1;
    // console.log(page)
    this.offersService.getSuggestedOffers(this.page, this.currentBounds)
      .subscribe((res: Paginated) => {
        if (!this.suggestedOffers) {
          this.suggestedOffers = res;
          console.log('getting suggested services', this.suggestedOffers)

        }
        else {
          if (this.suggestedOffers.lastDocId === res.lastDocId) return;
          let data = res;
          data.docs = this.suggestedOffers.docs.concat(res.docs);
          this.suggestedOffers = data;
          console.log('getting suggested services', this.suggestedOffers)
        }
      });
  }

  loadIncomingOffersPrice() {
    this.requestService.getRequestOffersPrice(this.id, this.currentBounds)
      .subscribe((res: any) => {
        console.log('gettting offers', res);
      }, err => { console.log(err) });
  }
  loadIncomingOffersDistance() {
    this.requestService.getRequestOffersDistance(this.id, this.currentBounds)
      .subscribe((res: any) => {
        console.log('gettting offers', res);
      }, err => { console.log(err) });
  }
  loadIncomingOffersNew() {
    this.requestService.getRequestOffersNew(this.id, this.currentBounds)
      .subscribe((res: any) => {
        console.log('gettting offers', res);
      }, err => { console.log(err) });
  }

  loadRequestOffers() {
    this.requestService.getRequestOffers(this.id, this.currentBounds)
      .subscribe((res: any) => {
        console.log('getting incoming offers', res);
        this.incomingOffers = res.docs;
        // this.suggestedOffers.docs.unshift(this.incomingOffers);
        // console.log('getting suggested services', this.suggestedOffers)
        for (let i=0; i<this.incomingOffers.length; i++) {

          // If current offer consists address prop with info - get coordinates, put them into 'address' prop and then get distance from address coordinates
          if(this.incomingOffers[i].address.city) {
            this.num = i;
            console.log(this.num)

            let address_str = this.incomingOffers[i].address.street1 + " " + this.incomingOffers[i].address.city + " " + this.incomingOffers[i].address.state + " " + this.incomingOffers[i].address.zip + " " + this.incomingOffers[i].address.country
            this.geoService.getGeoAddress(address_str)
              .then(
                resp => {
                  let location = [];
                  location.push(resp.results[0].geometry.location.lat) ;
                  location.push(resp.results[0].geometry.location.lng);
                  this.incomingOffers[i].address.coordinates = location;
                  this.incomingOffers[i].location.distance = this.getDistanceFromLatLonInKm(location[0], location[1], this.user.location.geoJson.coordinates[0], this.user.location.geoJson.coordinates[1] ) + ' km'
                })
          }
          // if current offer doesn't consist address prop with info - get distance from location coordinates
          else if (!this.incomingOffers[i].address.city) {
            this.incomingOffers[i].location.distance = this.getDistanceFromLatLonInKm(this.incomingOffers[i].location.geoJson.coordinates[0], this.incomingOffers[i].location.geoJson.coordinates[1], this.user.location.geoJson.coordinates[0], this.user.location.geoJson.coordinates[1] ) + ' km'
          }
        }
      },
        err => { console.log('No incoming offers available.') });
  }

  getDistance(coordinates1) {
    if (!this.user || !this.user.location || !this.user.location.geoJson) return '0km';
    return (
      this.getDistanceFromLatLonInKm(
        coordinates1[0],
        coordinates1[1],
        this.user.location.geoJson.coordinates[0],
        this.user.location.geoJson.coordinates[1]
      ) + ' km'
    );
  }

  getDistanceFromLatLonInKm(lon1, lat1, lon2, lat2) {
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

  addOverlayKey = (key) => {
    this.overlays[key] = true;
  }
  removeOverlayKey = (key) => {
    if (this.overlays[key]) delete this.overlays[key];
  }

  handleMapBoundsChange = (bounds: LatLngBounds) => {
    this.bounds = bounds;

    let myBounds = this.bounds;
    if (!myBounds) return;
    let southWest = myBounds.getSouthWest();
    let northEast = myBounds.getNorthEast();

    let boundsArr = [
      [southWest.lng(), southWest.lat()],
      [northEast.lng(), northEast.lat()]
    ];

    this.currentBounds = [];
    this.currentBounds.push(boundsArr[0]);
    this.currentBounds.push(boundsArr[1]);
    // console.log( this.currentBounds);
    // console.log( this.currentBounds);
  }

  selectSuggested(index) {
    this.selectedSuggestedItem = index;
    this.selectedIncomingItem = '';
  }
  selectIncoming(index) {
    this.selectedIncomingItem = index;
    this.selectedSuggestedItem = '';
    console.log(index)
  }

  redoSearch() {
    this.selectedIncomingItem = '';
    this.selectedSuggestedItem = '';
    this.page = +1;
    this.data = undefined;
    this.loadSuggestedOffers();
    this.loadRequestOffers();
  }

  click(id) {
    this.router.navigate(['/service/detail/' + id]);
  }

  getTimeAgo(createdAt){
   return ta.ago(Date.parse(createdAt));
  }

}
