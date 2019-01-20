import { Component, OnInit } from '@angular/core';
import { SellLocationService } from '../../../../services/sell-location.service';

@Component({
  selector: 'app-sell-location',
  templateUrl: './sell-location.component.html',
  styleUrls: ['./sell-location.component.css']
})
export class SellLocationComponent implements OnInit {
  private selectedLocation: string = "";
  private locationsList: any = [];
  private deletingObject: any = {};
  private locationsListError: any = false;
  private isSavingLocation: boolean = false;
  private isDeletingLocation: boolean = false;
  private location: any = {
    name: '',
    street1: '',
    street2: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    phone: '',
  };
  private errors: any = {}
  private errorsEdit: any = {}
  private serverError: any = false;
  private edit: any = {
    location: {},
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
  constructor(
    private sellLocationService: SellLocationService
  ) { }
  addNewLocation() {
    this.selectedLocation = "addLocation";
  }
  selectLocation(locationObject) {
    this.selectedLocation = locationObject.id;
    this.edit.location = locationObject;
    this.edit.data = {
      name: locationObject.name,
      street1: locationObject.street1,
      street2: locationObject.street2,
      city: locationObject.city,
      state: locationObject.state,
      zip: locationObject.zip,
      country: locationObject.country,
      phone: locationObject.phone,
    }
  }
  saveLocation() {
    if (this.isSavingLocation) return;
    this.errors = {};
    if (this.validation(this.location, this.errors)) {
      this.isSavingLocation = true;
      this.addLocation()
    }
  }
  editUpdateLocation(){
    if (this.edit.isEditProccess) return;
    this.errorsEdit = {};
    if (this.validation(this.edit.data, this.errorsEdit)) {
      this.edit.isEditProccess = true;
      this.updateLocation();
    }
  }


  //Technical function
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
  addLocation() {
    this.sellLocationService.addStoreLocation(this.location)
      .subscribe(
        res => {
          console.log('this.sellLocationService.addStoreLocation', res)
          this.updateLocationList();
          this.errors={}
          this.errorsEdit={}
          this.serverError={}
        },
        err => {
          console.log("this.sellLocationService.addStoreLocation ERR", err)
          this.serverError = err.error;
          this.isSavingLocation = false;
        }
      )
  }
  updateLocationList() {
    this.sellLocationService.getStoreLocation()
      .subscribe(
        res => {
          console.log('this.sellLocationService.getStoreLocation', res);
          this.locationsList = res['docs'].map(element => {
            element.id = element._id;
            return element;
          });
          this.locationsListError = [];
          this.reset();
        },
        err => {
          console.log('this.sellLocationService.getStoreLocation ERR', err)
          this.locationsListError = err.error;
          this.locationsList = [];
        }
      )
  }
  modalAccept(){
    this.deletingObject.isDeleting = true;
    this.sellLocationService.deleteStoreLocation(this.deletingObject.id)
      .subscribe(res => {
        console.log('this.sellLocationService.addStoreLocation', res)
        this.updateLocationList();
      })
  }
  deleteLocation(object) {
    this.deletingObject = object;
  }
  updateLocation(){
    this.isDeletingLocation = true;
    this.sellLocationService.updateStoreLocation(this.edit.location.id,this.edit.data)
      .subscribe(
        res=>{
          console.log("this.sellLocationService.addStoreLocation", res)
          this.updateLocationList();
        },
        err=>{
          console.log("this.sellLocationService.addStoreLocation ERR", err)
          this.serverError = err.error;
          this.edit.isEditProccess  = false;
        }
      )
  }
  reset() {
    this.isSavingLocation = false;
    this.isDeletingLocation = false;
    this.selectedLocation = "";
    this.location = {
      name: '', street1: '',
      street2: '', city: '',
      state: '', zip: '',
      country: '', phone: ''
    }
    this.errors = {}
    this.edit = {
      location: {},
      isEditProccess: false,
      data: {
        name: '', street1: '',
        street2: '', city: '',
        state: '', zip: '',
        country: '', phone: ''
      }
    };
  }
  ngOnInit() {
    this.updateLocationList();
  }

}
