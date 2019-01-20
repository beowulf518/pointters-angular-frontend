import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { BackgroundCheckService } from './../../../../services/background-check.service';
import { Component, OnInit } from '@angular/core';
import { BraintreeService } from '../../../../services/braintree.service';
import { UserService } from '../../../../services/user.service';
import { states } from '../../../../interfaces/states';
import {User} from '../../../../interfaces/user';
import { ServiceService } from '../../../../services/service.service';


let emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;


var dropin = require('braintree-web-drop-in');
var moment = require('moment');
var currentYear = moment().year();

let years = new Array(100).fill(false).map((el, i) => {
  let val = currentYear - i;
  return { value: val, label: val };
});
let all_days = new Array(31).fill(true).map((el, i) => {
  return { value: i, label: i };
});


@Component({
  selector: 'app-sell-check-form',
  templateUrl: './sell-check-form.component.html',
  styleUrls: ['./sell-check-form.component.css']
})
export class SellCheckFormComponent implements OnInit {

  private braintreeToken: string;
  private user: User;
  private isInvalid:any=false;
  private moment: any = moment;
  private invalidFields = {};
  private model = {
    firstName: '',
    middleName:'',
    lastName: '',
    email: '',
    phone: '',
    bd_month: undefined,
    bd_day: undefined,
    bd_year: undefined,
    ssn: '',
    zip: '',
    license: '',
    licenseState: undefined
  }

  private monthOptions = [
    { label: 'January', value: 1 },
    { label: 'February', value: 2 },
    { label: 'March', value: 3 },
    { label: 'April', value: 4 },
    { label: 'May', value: 5 },
    { label: 'June', value: 6 },
    { label: 'July', value: 7 },
    { label: 'August', value: 8 },
    { label: 'September', value: 9 },
    { label: 'October', value: 10 },
    { label: 'November', value: 11 },
    { label: 'December', value: 12 }
  ];
  private dateOptions = [];
  private yearOptions = years;
  private stateOptions = states;
  private currentDayOptions = [];
  private selectDateDisabled = true;


  constructor(
    private BackgroundCheckService: BackgroundCheckService,
    private userService: UserService,
    private ServiceService:ServiceService,
    private router: Router,
    private toastr: ToastrService,
  ) { }
  // Error handler for Error's in subscribe method
  errorHandler(error) {
    this.toastr.error(error.error.message, `Error!`);
    console.error(error)
  }
  handleSelectMonth = (val) => {
    let days = moment(`${currentYear}-${ val >= 10 ? val : '0' + val }`).daysInMonth();

    this.currentDayOptions = all_days.slice(1, days + 1)
  }

  submit(){
    this.validateForm();
    if(Object.keys(this.invalidFields).length !== 0) return;

    let payload ={
      "firstName": this.model.firstName,
      "middleName": this.model.middleName,
      "lastName": this.model.lastName,
      "email": this.model.email,
      "phone": this.model.phone,
      "zipcode": this.model.zip,
      "dob":`${this.model.bd_year}-${this.model.bd_month}-${this.model.bd_day}`, 
      "ssn": this.model.ssn,
      "driverLicenseNumber": this.model.license,
      "driverLicenseState" :this.model.licenseState
  }
  this.BackgroundCheckService.postBackgroundCheck(payload)
    .subscribe(
      res=>{
        this.BackgroundCheckService.getBackgroundCheck(res['_id'])
        .subscribe(
          res=>{
            this.ServiceService.checkOutData={
              backgroundCheck:{
                object:res
              },
            }
            this.router.navigateByUrl('/checkout');
          },this.errorHandler
        )
      },this.errorHandler
    )
  }
  validateForm = () => {
    Object.keys(this.model).map(key => {
      if (!this.model[key]) this['invalidFields'][key] = true;
      else if (key === 'email' && !emailRegex.test(this.model.email)) this['invalidFields'][key] = true;
      else if (this.model[key] && this['invalidFields'][key]) delete this['invalidFields'][key];
    })
    if(Object.keys(this.invalidFields).length !== 0){
      this.isInvalid=true;
    }else{
      this.isInvalid= false;
    }
  }

  ngOnInit() {
    this.userService.user.subscribe(user => {
      this.user = user;
    });
  }

}
