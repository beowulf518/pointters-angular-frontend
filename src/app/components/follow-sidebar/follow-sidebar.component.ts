import { Component, EventEmitter, Output, OnInit , Input } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from './../../services/auth.service';
import { UserService } from './../../services/user.service';

@Component({
  selector: 'app-follow-sidebar',
  templateUrl: './follow-sidebar.component.html',
  styleUrls: ['./follow-sidebar.component.css']
})
export class FollowSidebarComponent implements OnInit {
  @Input() selectedTab: string;
  @Output() successHandler = new EventEmitter<boolean>();
   constructor(
    private authService: AuthService,
    public userService: UserService,
    private router: Router
   ) {
    
   }

  ngOnInit() {
    // console.log(this.selectedTab);
  }
  
  onClickLogout(): void {
    this.successHandler.emit(true);
  	this.authService.signout()
      .subscribe(
        (res) => {
          console.log('logout success');
        },
        (err) => {
          console.log(err);
        }
      );
    this.router.navigate(["/"]);
  }

}
