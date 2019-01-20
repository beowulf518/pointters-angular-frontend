import { Component, OnInit } from '@angular/core';
import { OrderService } from "../../services/order.service";
import { UserService } from "../../services/user.service";
import { ActivatedRoute,Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";

import { User } from '../../interfaces/user';

declare var $: any;

@Component({
  selector: 'app-cancel-request',
  templateUrl: './cancel-request.component.html',
  styleUrls: ['./cancel-request.component.css']
})

export class CancelRequestComponent implements OnInit {
  private orderId:any = '';
  private reason:any = 'not_on_time';
  private message:any = '';
  private isBuyer:any = false;
  private isSeller:any = false;
  private order:any = '';
  public user: User;

  constructor(
    private orderService:OrderService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr:ToastrService,
    private userService:UserService
  ) { }
  sendCancelation(){
    let payload = {
      buyerOrderDispute:{
        reason:this.reason,
        message:this.message
      }
    }
    this.orderService.putOrderCancel(this.orderId,payload)
    .subscribe(res=>{
      this.toastr.success('Your cancelation was sent!', 'Cancelation sent!')
      this.router.navigateByUrl('/order/' + this.orderId);
      console.log('putOrderCancel',res)
    },
    err=>{
      this.toastr.error(err['error'].message, 'Cancelation failed!')
      console.log('putOrderCancel err',err)
    }
    )
  } 
  ngOnInit() {
    this.orderId = this.route.snapshot.params["id"];
    this.userService.user.subscribe(user => {
      if(user == null) return;
      this.user = user;
      this.orderService.getOrder(this.orderId)
      .subscribe(
        res=>{
          if(res['order'].buyerOrderDispute){
            this.reason = res['order'].buyerOrderDispute.reason
            this.message = res['order'].buyerOrderDispute.message
          }
          res['order'].buyerId == this.user['_id']?this.isBuyer=true:null;
          res['order'].sellerId == this.user['_id']?this.isSeller=true:null;
          this.order = res['order'];
        }
      )
    });
  }

}
