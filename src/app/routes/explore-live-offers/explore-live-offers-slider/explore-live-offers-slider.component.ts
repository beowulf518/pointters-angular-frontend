import { Component, OnInit, EventEmitter, Input, Output, OnChanges, ViewChild } from '@angular/core';
import { SwiperComponent, SwiperDirective, SwiperConfigInterface,
  SwiperScrollbarInterface, SwiperPaginationInterface } from 'ngx-swiper-wrapper';
import { User } from '../../../interfaces/user';
import { As3Service } from '../../../services/as3.service';
import {Router} from '@angular/router';

const uuid = require('uuid/v4');


@Component({
  selector: 'live-offers-slider',
  templateUrl: './explore-live-offers-slider.component.html',
  styleUrls: ['../explore-live-offers.component.css']
})
export class ExploreLiveOffersSliderComponent implements OnInit {

  constructor(
    private as3Service: As3Service,
    private router: Router

  ) {}

  @Input() slides: Array<any>;
  @Input() loadMore: Function;
  @Input() slidesPerView: number = 3;
  @Input() extView: boolean = false;
  @Input() user: User;

  @ViewChild('swiper') swiper: SwiperDirective;

  private config: SwiperConfigInterface = {
    direction: 'horizontal',
    slidesPerView: this.slidesPerView,
    navigation: true
  }

  public medias = [];
  private isLoading = false;


  ngOnInit() {
    this.config.slidesPerView = this.slidesPerView;
  }

  ngOnChanges(changes) {
    if (changes.slides && changes.slides.currentValue !== changes.slides.previousValue) {
      this.swiper.update();
    }
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
      }
    );

  }

  onRemoveImageItem(index) {
    this.medias.splice(index, 1);
  }

  onDetail(id) {
    // this.router.routeReuseStrategy.shouldReuseRoute = function(){return false;};

    const currentUrl = this.router.url + "?";

    this.router.navigateByUrl(currentUrl).then(() => {
      this.router.navigated = false;
      this.router.navigate(["/service/detail/" + id]);
    });
  }



  trackByFn(index, item) {
    return item.id;
  }

  onEndReached() {
    this.loadMore();
  }

  getDistance(coordinates1) {
    if (!this.user||!this.user.location.geoJson) return '0km';
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

  toDetailPage(id){
    this.router.navigate(['/service/detail/' + id]);

  }

}
