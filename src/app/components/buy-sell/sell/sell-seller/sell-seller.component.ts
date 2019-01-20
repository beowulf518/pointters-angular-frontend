import { Component, OnInit } from '@angular/core';
import {User, UserSellerEligibility} from '../../../../interfaces/user';
import {UserService} from '../../../../services/user.service';
import {ServiceAddComponent} from '../../../../routes/service/service-add/service-add.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-sell-seller',
  templateUrl: './sell-seller.component.html',
  styleUrls: ['./sell-seller.component.css']
})
export class SellSellerComponent implements OnInit {


  public user: User;
  public eligibility: UserSellerEligibility;

  constructor(
    private userService: UserService,
    private modalService: NgbModal

  ) { }

  ngOnInit() {

    this.userService.user.subscribe(user => {
      this.user = user;

      this.userService.getSellerEligibility().subscribe(eligibility => {
        this.eligibility = eligibility;
      });

    });

  }


  openAddService() {
    const modalRef = this.modalService.open(ServiceAddComponent);
    const serviceAddComponent : ServiceAddComponent = modalRef.componentInstance as ServiceAddComponent

  }

}
