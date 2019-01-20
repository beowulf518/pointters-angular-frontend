import { Component, OnInit } from '@angular/core';
import { UserService } from './../../../services/user.service';
import { ToastrService } from "ngx-toastr";

@Component({
  selector: 'app-general-following',
  templateUrl: './general-following.component.html',
  styleUrls: ['./general-following.component.css']
})
export class GeneralFollowingComponent implements OnInit {

  followings: Array<Object> = [];
  hasMore: boolean = true;
  lastDocId: string;
  isLoading:boolean=false;

  constructor(
    private userService: UserService,
    private toastr: ToastrService
  ) { }

  follow(id){
    this.userService.follow(id)
    .subscribe(
      res=>{
        this.toastr.success('You followed this user','Follow user');
        console.log(res)
        this.followings.map((element,index)=>{
          if (element['followTo'].id == id){
            this.followings[index]['isFollowed'] = true;
          }
        })
      },
      err=>{
        this.toastr.error(err.error.message,'Error unfollow user');
      }
    )
  }

  unfollowUser(id){
    this.userService.unFollow(id)
      .subscribe(
        res=>{
        this.toastr.success('You unfollowed this user','Unfollow user');
          console.log(res)
          this.followings.map((element,index)=>{
            if (element['followTo'].id == id){
              this.followings[index]['isFollowed'] = false;
            }
          })
        },
        err=>{
          this.toastr.error(err.error.message,'Error unfollow user');
        }
      )
  }
  scrollHandler() {
    this.isLoading = true;
    this.updateFolowing()
  }
  updateFolowing(){
    this.userService.getFollowing(this.lastDocId)
      .subscribe((data: any) => {
        console.log('this.userService.getFollowing', data);
        const { docs, total, limit, page, lastDocId } = data;
        this.hasMore = (total > limit * page);
        let modifyDocs =  docs.map(element=>{
          element['isFollowed'] = true;
          return element;
        })
        this.lastDocId = lastDocId;
        this.isLoading = false;
        this.followings = this.followings.concat(modifyDocs);
      }, (err) => {
        console.log(err);
        this.isLoading = false;
        this.hasMore = false;
      });
  }
  ngOnInit() {
    this.updateFolowing()
  }

}
