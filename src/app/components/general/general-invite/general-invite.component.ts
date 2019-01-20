import { NgxCarousel, NgxCarouselStore } from 'ngx-carousel';
import { ToastrService } from 'ngx-toastr';
import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import 'social-share-kit/dist/js/social-share-kit.min.js';

@Component({
  selector: 'app-general-invite',
  templateUrl: './general-invite.component.html',
  styleUrls: ['./general-invite.component.css','./css/social-share-kit.css']
})
export class GeneralInviteComponent implements OnInit {
  public carouselBanner: NgxCarousel;
  private emailInput: any = '';
  private emailInputMessage: any;
  private suggestedFB: any;
  private emailRegex: any = /^([\w\.\-_]+)?\w+@[\w-_]+(\.\w+){1,}$/;
  private initsuggestedFollow: any = 6;
  private initsuggestedFollowIndex: any = 0;
  private suggestedFollow: any;
  private suggestedFollowFB: any;
  private initsuggestedFollowFB: any = 6;
  private initsuggestedFollowIndexFB: any = 0;
  private followProgress:any=false;
  private slideConfig = { "slidesToShow": 4, "slidesToScroll": 4 };

  constructor(
    private userService: UserService,
    private toastr: ToastrService,

  ) { }

  // Error handler for Error's in subscribe method
  errorHandler(error) {
    this.toastr.error(error.error.message, `Error!`);
    console.error(error)
  }
  changeFollowState(id,state){
    this.suggestedFollow.map(element=>{
      if(element.userId==id){element.hasFollowed=state};
    })
    this.suggestedFollowFB.map(element=>{
      if(element.userId==id){element.hasFollowed=state};
    })
  }
  toggleFollow(id,isFollowed){

    if(this.followProgress)return;
    this.followProgress=true;
    if(!isFollowed){
      this.userService.follow(id)
      .subscribe(res=>{this.followProgress=false;this.changeFollowState(id,true)},this.errorHandler)
    }else{
      this.userService.unFollow(id)
      .subscribe(res=>{this.followProgress=false;this.changeFollowState(id,false)},this.errorHandler)
    }
  }
  sendEmailInvites() {
    let emails = this.emailInput.split(',')
    let emailsArray = [];
    emails.map(element => {
      let testing = element.trim()
      if (this.emailRegex.test(testing)) {
        emailsArray.push(testing);
      }
    })
    let payload = { 'email': emailsArray, 'message': this.emailInputMessage }
    this.userService.inviteByEmail(payload)
      .subscribe(
        res => {
          this.resetEmailInvate()
          this.toastr.success('Invite\'s has been sent!', 'Email invite!');

        }, this.errorHandler)
  }
  resetEmailInvate() {
    this.emailInput = "";
    this.emailInputMessage = "";
  }

  carouselLoadFB(data) {
    this.initsuggestedFollowIndex++;
    this.userService.getsuggestedFB(this.initsuggestedFollowFB * this.initsuggestedFollowIndexFB, 6)
      .subscribe(res => {
        this.suggestedFollowFB = this.suggestedFollowFB.concat(res);
      }, this.errorHandler)
  }
  carouselLoad(data) {
    this.initsuggestedFollowIndex++;
    this.userService.getsuggestedFollow(this.initsuggestedFollow * this.initsuggestedFollowIndex, 6)
      .subscribe(res => {
        this.suggestedFollow = this.suggestedFollow.concat(res);
      }, this.errorHandler)
  }
  ngOnInit() {
    window['SocialShareKit'].init({
      url:window.location.origin
    })
    this.userService.getsuggestedFB(this.initsuggestedFollowFB * this.initsuggestedFollowIndexFB, 6)
      .subscribe(res => { this.suggestedFollowFB = res; }, this.errorHandler)

    this.userService.getsuggestedFollow(this.initsuggestedFollow * this.initsuggestedFollowIndex, 6)
      .subscribe(res => { this.suggestedFollow = res; }, this.errorHandler)

    // carousel Banner
    this.carouselBanner = {
      grid: { xs: 1, sm: 3, md: 3, lg: 3, all: 0 },
      slide: 1,
      speed: 400,
      point: { visible: false },
      load: 1,
      loop: false,
      touch: true
    };
  }

}
