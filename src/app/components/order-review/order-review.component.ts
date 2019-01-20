import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { ServiceService } from "../../services/service.service";

declare var $: any;

@Component({
  selector: 'order-review',
  templateUrl: './order-review.component.html',
  styleUrls: ['./order-review.component.css']
})

export class OrderReviewComponent implements OnInit, OnChanges {
  @Input('orderId') orderId: string;
  @Input('serviceId') serviceId: string;
  @Input('sellerId') sellerId: string;
  @Input('review') review: any = false;
  @Input() isReviewed:boolean = false;
  @Output() onReviewSend = new EventEmitter();

  private comment:any = '';
  private qualityOfService:any = undefined;
  private overallRating = 0;
  private willingToBuyServiceAgain:any = "1";

  private error:any= {
    msg:''
  }

  constructor(
    private orderService:OrderService,
    private serviceService:ServiceService
  ){}



  sendReview(){
    this.error.msg="";
    // if(this.validation()){
      let payload = {
        "comment": this.comment,
        "isActive": true,
        "qualityOfService": this.qualityOfService,
        "overallRating": this.overallRating,
        "serviceId": this.serviceId,
        "sellerId":this.sellerId,
        "orderId":this.orderId,
        "willingToBuyServiceAgain": this.willingToBuyServiceAgain
      }
      this.serviceService.postReview(this.serviceId,payload)
      .subscribe(
        res=>{
          this.isReviewed = !this.isReviewed;
          console.log(this.isReviewed)

          this.onReviewSend.emit(payload);
          console.log('this.serviceService.postReview', res)
        },
        err=>{
          console.log('this.serviceService.postReview', err)
          this.isReviewed = !this.isReviewed;
        }
      )
    // }
  }
  validation(){
    if(this.qualityOfService == undefined){this.error.msg = "Please, choose quality of service";return false;}
    if(this.comment == ''){this.error.msg = "Please, leave some message for seller";return false;}
    //if(this.comment.length < 100){this.error.msg = "Message should be longer than 100 characters";return false;}
    return true;
  }
  ngOnInit() {
    console.log('this.review',this.review)

    this.serviceService.getReview(this.serviceId)
    .subscribe(
      res=>{
        console.log('this.serviceService.getReview', res)
      },
      err=>{
        console.log('this.serviceService.getReview', err)
      }
    )

  }
  ngOnChanges(changes) {
    console.log('input changed', changes);
    if(changes['review'].currentValue){
      this.isReviewed = true;
      this.comment= changes.review.currentValue.comment;
      this.qualityOfService= changes.review.currentValue.qualityOfService;
      this.overallRating=changes.review.currentValue.overallRating;
      this.willingToBuyServiceAgain= changes.review.currentValue.willingToBuyServiceAgain;
    }
  }
}
