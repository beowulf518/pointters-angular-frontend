import { Component, OnInit } from "@angular/core";
import { RequestService } from "../../../services/request.service";
import { UserService } from "../../../services/user.service";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap/modal/modal';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap/modal/modal-ref";
import { Router } from "@angular/router";
import { User } from "../../../interfaces/user";
import { createNumberMask } from 'text-mask-addons';
import { SendOfferModalComponent } from '../send-offer-modal/send-offer-modal.component';
import { SwiperConfigInterface } from 'ngx-swiper-wrapper';
import { DateTime } from 'luxon';
import { As3Service } from '../../../services/as3.service';
import {lifeOffersSocketService} from '../../../services/lifeOffersRequest.service';
import {ServiceService} from '../../../services/service.service';
import {ToastrService} from 'ngx-toastr';

let moment = require('moment');
const uuid = require('uuid/v4');


@Component({
  selector: 'app-job-detail-modal',
  templateUrl: './job-detail.component.html',
  styleUrls: ['./job-detail.component.css']
})
export class JobDetailModalComponent implements OnInit {

  public authorName;
  public currentLocation:any;
  public componentData: any = '';
  private medias = [];
  private isLoading = false;
  private moment: any = moment;
  private locationStr;
  private model: any;
  private editOfferEnabled: boolean = false;
  private offerToEdit: null;
  private offerToEditId: string;
  private id: string;
  private user: User;
  private editable: boolean = false;
  private priceRange = "";
  private localTime;
  private displayTime: string = 'No time selected';
  private displayDate = "";
  private displaySchedule = "";
  private expiresOn = new Date();
  private scheduleDate = new Date();
  private triggerJobsUpdate: Function;
  private priceMask = createNumberMask({
    prefix: '$'
  });

  // ui settings
  public swiperConfig = {
    slidesPerView: 3,
    breakpoints: {
      400: {
        slidesPerView: 1,
        spaceBetween: 10
      },
      600: {
        slidesPerView: 2,
        spaceBetween: 20
      },
      800: {
        slidesPerView: 3,
        spaceBetween: 30
      }
    }
  };

  public config: SwiperConfigInterface = {
    a11y: true,
    direction: 'horizontal',
    slidesPerView: 3,
    spaceBetween: 20,
    navigation: true,
    keyboard: true,
    mousewheel: true
  };

  public userSettings: any = {
    showRecentSearch: false,
    showSearchButton: false,
    inputPlaceholderText: 'Type Location',
    geoTypes: ['(regions)', '(cities), \'establishment\', \'geocode\''],
    currentLocIconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAANCAYAAACZ3F9/AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAHPSURBVChTbVI9TxtBEH0+n80lWDSxQTIfFgGlSATUdFEEXWo6FFEkootC+AsUiUJDSYFQClJRIChAYCkSQkTQGQchUKIgSEThGPn8wXG3t8PMEj4MedLe7s68t3vzdiLEwH/w+ThAhOfhtthl4A7uCYs+IVtQmPzpm/344zieJ20k43LMDeqEm0WFd7se/rL4WSJqYt8rIRLRCD4+dTCYsk3MQISC7VNF6RWX3ufP6Fc1JK3JDFmPcUxywrmCuVGuHNisotWxMNPnYLeiMX3oo6XBwqv2GNINEbzNe9iraqz1N5ra4SlN+5WQYkslMxfONWVWXcJiyYzer2UqBZoObnFEYy2cKLzcquGBBXQ/tPDtVOHQu/ErV9bYKIbo4pxwhCsaq7fJwgj/zrkGD0I7Z2O3DGQumtlRj3PCEa5ojDleqKl52aX5P74x5MOBR51rLqXYkLGdGikOzh37lGKOcI0t5suY2PfoSdalnZK6djPvKgp4k+NYB9ctnCtcv2NVEd7kzrDO9bzuiGMgGYUksoUQM0c+XjyyMdXjoJHfVFDXAGUWf/kdYPYowI8aF8QQU0YzcQylbTj/RIJ7LSeo8AHj3EGCT9wxCbu+3QDgAopkTBqRVW1CAAAAAElFTkSuQmCC'
  };

  private categories: any = [];
  private categoriesTransfer: any = [];
  private addMethod_opened: boolean = false;
  private category = -1;

  constructor(

    private as3Service: As3Service,
    private requestService: RequestService,
    private userService: UserService,
    private modalService: NgbModal,
    private activeModal: NgbActiveModal,
    private router: Router,
    private serviceService: ServiceService,
    private toastr: ToastrService,

  ) {}

  ngOnInit() {
    this.userService.user.subscribe(user => {
      this.user = user;

      if (this.model) {
        // console.log(this.model.userId)
        if (this.user._id === this.model.userId) {
          this.editable = true;
          // this.displayDate;
        }
      }
    });

    this.getRequest();
    this.getCategory();


  }

  getRequest() {
    this.requestService.get(this.id).subscribe(res => {
      this.model = res;
      this.medias = this.model.media;
      console.log(this.model)
      this.priceRange = `$${this.model.minPrice} - $${this.model.maxPrice}`;
      this.displaySchedule = DateTime.fromISO(
        this.model.scheduleDate
      ).toFormat('LL/dd/yyyy | t');

      this.getAuthor();

      if (this.user) {
        if (this.user._id === this.model.userId) {
          this.editable = true;

          this.displayDate = moment(this.model.scheduleDate).format("MMM D, YYYY");
          this.displayTime = this.model.scheduleDate;
        }
      }
      let str = [];
      for (let key in this.model.location) {
        switch (key) {
          case('city'):
            str.push(this.model.location[key]);
            break;
          case('province'):
            if (this.model.location[key] !== 'NA') {
              str.push(this.model.location[key]);
            }
            break;
          case('state'):
            if (this.model.location[key] !== 'NA') {
              str.push(this.model.location[key]);
            }
            break;
          case('country'):
            str.push(this.model.location[key]);
            break;
          case('postalCode'):
            // str.push(this.model.location[key])
            str.unshift(this.model.location[key]);
            break;
        }
      }
      this.locationStr = str.join(", ");
      // console.log(this.locationStr)
      setTimeout(() => {
        this.userSettings['inputString'] = this.locationStr;
        this.userSettings = Object.assign({}, this.userSettings);
      }, 10);
    });
  }

  getAuthor(){
    this.userService.getUserProfile(this.model.userId)
      .subscribe (
        res => {this.authorName = res.result.firstName},
        err => {console.log(err) });
  }

  getCategory() {
    // Get category
    this.serviceService.getCategories().subscribe(
      (res: { categories: any[] }) => {
        // console.log(res.categories)
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
      }
    );
  }

  closeModal() {
    this.activeModal.close();

  }

  sendOffer() {
    const modalRef = this.modalService.open(SendOfferModalComponent, { windowClass: 'send-offer-modal' });
    modalRef.componentInstance.model = this.model;
    modalRef.componentInstance.linkedJobId = this.id;
    this.activeModal.close();
  }

  editOffer() {
    const modalRef = this.modalService.open(SendOfferModalComponent, { windowClass: 'send-offer-modal' });
    modalRef.componentInstance.model = this.model;
    modalRef.componentInstance.offerToEdit = this.offerToEdit;
    modalRef.componentInstance.linkedJobId = this.id;
    modalRef.componentInstance.id = this.offerToEditId;
    modalRef.componentInstance.editable = true;
    this.activeModal.close();
  }

  saveJob() {

    let timeHH = moment(this.displayTime).format("HH");
    let timeMM = moment(this.displayTime).format("mm");

    let date = moment(this.displayDate);
    let fullDate = date.add(timeHH,'hours').add(timeMM,'minutes');

    this.model.scheduleDate = fullDate.utc().toISOString()
    console.log(this.model.scheduleDate);

    let id = this.model._id;
    let data = this.model;
    data['expiresAt'] = this.expiresOn.toISOString();

    if (typeof data['minPrice'] === 'string') {
      if (data['minPrice'][0] === '$') data['minPrice'] = data['minPrice'].substr(1);
      data['minPrice'] = parseInt(data['minPrice'].replace(/,/g, ''));
    }
    if (typeof data['maxPrice'] === 'string') {
      if (data['maxPrice'][0] === '$') data['maxPrice'] = data['maxPrice'].substr(1);
      data['maxPrice'] = parseInt(data['maxPrice'].replace(/,/g, ''));
    }

    this.requestService.updateRequest(data, id)
      .first()
      .subscribe(res => {
        console.log(res);
        this.toastr.success('Success!', 'Request updated');
        this.triggerJobsUpdate();
        this.closeModal();
      }, err => {
        console.log(err)
        this.toastr.error(err.error.message, 'Update request failed');

      })
  }

  deleteJob() {
    let id = this.model._id;
    this.requestService.deleteRequest(id)
      .first()
      .subscribe(res => {
        if (res && res['success']) {
          this.triggerJobsUpdate();
          this.closeModal();
        }
      })
  }

  goToChat() {
    this.router.navigateByUrl('/chat/' + this.model.userId);
    this.closeModal();
  }

  onOpenCategory() {
    this.addMethod_opened = false;
    // this.addPrice_opened = false;
  }

  onCategory(index) {
    this.category = index;
    this.categories[index].score = index;
    // console.log(this.categories[index]);
    this.model.category = this.categories[index];
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
        this.model.media = this.medias;
      });
  }

  onRemoveImageItem(index) {
    this.model.media.splice(index, 1);
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

        // case("administrative_area_level_2"):
        //   locationTemp['area'] = location.long_name;
        //   str.push(location.long_name)
        //   break;

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
    this.model.location = locationTemp;

    setTimeout(() => {
      this.userSettings['inputString'] = this.locationStr;
      this.userSettings = Object.assign({}, this.userSettings);
    }, 10);

  }

  modalTime() {
    let owlTime = document.querySelector('.owl-time');
    owlTime.appendChild(document.getElementsByTagName('owl-date-time-container')[0])
  }

}
