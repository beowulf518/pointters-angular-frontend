import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { User } from '../../../interfaces/user';
import { ToastrService } from "ngx-toastr";
@Component({
  selector: 'app-edit-privacy',
  templateUrl: './edit-privacy.component.html',
  styleUrls: ['./edit-privacy.component.css']
})
export class EditPrivacyComponent implements OnInit {

  public user: any;

  public view_location: string;
  public view_phone: string;

  constructor(
    private userService: UserService,
    private toastr: ToastrService,
  ) { }

  ngOnInit() {
    this.userService.user
      .filter(val => val != null)
      .subscribe(user => {
        this.user = user;

        this.view_phone = this.user.settings.phoneViewPermission;
        this.view_location = this.user.settings.locationViewPermission;

      });
  }

  onViewPhoneChange(evt) {
    this.view_phone = evt;
  }

  onViewLocationChange(evt) {
    this.view_location = evt;
  }

  onSave() {
    this.userService.setPermissions({
      'phoneViewPermission': this.view_phone,
      'locationViewPermission': this.view_location,
    }).subscribe(res => {
      this.toastr.success('Privacy setting\'s succefully changed', 'Privacy setting\'s save');
    }, err => {
      this.toastr.error('Some error occurred while privacy setting saving', 'Privacy setting\'s  don\'t save');
    });

  }
}
