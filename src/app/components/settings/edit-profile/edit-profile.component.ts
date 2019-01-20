import { Component, OnInit } from "@angular/core";
import { UserService } from "./../../../services/user.service";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { User } from "./../../../interfaces/user";
import { environment } from "./../../../../environments/environment";
import { GeolocationService } from "../../../services/geolocation.service";
import { As3Service } from '../../../services/as3.service';
import {ToastrService} from 'ngx-toastr';

declare var google: any;

const uuid = require('uuid/v4');


@Component({
  selector: "app-edit-profile",
  templateUrl: "./edit-profile.component.html",
  styleUrls: ["./edit-profile.component.scss"]
})
export class EditProfileComponent implements OnInit {
  user: User;
  location;
  currentlocation: string;
  profileBackgroundDefault = "assets/images/icons/add_image.png";


  private loading;

  public medias = [];

  public swiperConfig = {
    slidesPerView: 3,
    spaceBetween: 15,
    breakpoints: {
      400: {
        slidesPerView: 1,
        spaceBetween: 15
      },
      600: {
        slidesPerView: 1,
        spaceBetween: 20
      },
      800: {
        slidesPerView: 1,
        spaceBetween: 30
      }
    }
  };



  public userSettings: any = {
    showCurrentLocation: true,
    geoLocation: [37.76999, -122.44696]
  };

  public componentData1: any = "";

  constructor(private userService: UserService,
    private geolocation: GeolocationService,
    private as3Service: As3Service,
              private toastr: ToastrService,

  ) {}

  ngOnInit() {
    this.userService.user.subscribe(user => {
      if(user) {
        this.user = user;
        this.location = this.user.location;
        this.medias = this.user.profileBackgroundMedia;
      }

    });
  }

  onSave() {
    this.user.profileBackgroundMedia = this.medias;
    this.userService.update(this.user).subscribe(res => {
      this.toastr.success('Profile Saved Succefully')
    }, err => {
      this.toastr.error('Failed to save profile, please check that required fields are filled')
    });
  }

  onCancel() {
    window.scrollTo(0, 0);
  }

  makeid(text = "") {
    const possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  onUpdateProfilePhoto(event: any) {

    console.log("called")
    if(event.target.files.length == 0) {
      return;
    }

    const file = event.target.files[0];
    const fileData =  {
      file: file,
      fileName: uuid(),
      mediaType: file.type.split('/')[0],
    };


    // setting loading indicator while uploading images
    this.loading = true;

    this.as3Service.uploadMedia(fileData).subscribe(
      (res) => {

        this.user.profilePic = res[0]['path'],
        this.loading = false;
      }
    );
  }


  onUploadBackground(event) {

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
    this.loading = true;

    this.as3Service.uploadMedia(medias).subscribe(
      (res) => {

        this.medias = [ ...this.medias, ...medias.map( (media, index) => {
          return {
            mediaType: media.mediaType,
            fileName: res[index]['path'],
          };
        })];

        this.loading = false;
      }
    );
  }


  onRemoveImageItem(index) {
    this.medias.splice(index, 1);
  }

  getCurrentLocation() {
    return this.geolocation.getCurrentLocation().subscribe(location => {
      this.user.location = location;
      this.location = location;
    });
  }

}
