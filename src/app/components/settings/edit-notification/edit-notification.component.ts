import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { User } from '../../../interfaces/user';
import { ToastrService } from "ngx-toastr";

@Component({
  selector: 'app-edit-notification',
  templateUrl: './edit-notification.component.html',
  styleUrls: ['./edit-notification.component.css']
})
export class EditNotificationComponent implements OnInit {
  public user: any;

  private generalNotifications: string = "";
  private orderNotifications: string = "";
  private offerNotifications: string = "";
  private summaryEmail: string = "";

  constructor(
    private userService: UserService,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.userService.user
      .filter(val => val != null)
      .subscribe(user => {
        this.user = user;

        this.generalNotifications = this.user.settings.generalNotifications;
        this.orderNotifications = this.user.settings.orderNotifications;
        this.offerNotifications = this.user.settings.offerNotifications;
        this.summaryEmail = this.user.settings.summaryEmail;

      });
  }
  selectChanged(ref,evnt){
    this[ref] = evnt;
  }
  onSave() {
    this.userService.setPermissions({
      'generalNotifications': this.generalNotifications,
      'orderNotifications': this.orderNotifications,
      'offerNotifications': this.offerNotifications,
      'summaryEmail': this.summaryEmail,
    }).subscribe(res => {
      this.toastr.success('Notification succefully changed', 'Notification save');
    }, err => {
      this.toastr.error('Some error occurred while notification saving', 'Notification don\'t save');
    });

  }

}
