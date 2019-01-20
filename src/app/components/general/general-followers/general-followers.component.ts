import { Component, OnInit } from '@angular/core';
import { UserService } from './../../../services/user.service';
import { ToastrService } from "ngx-toastr";


@Component({
  selector: 'app-general-followers',
  templateUrl: './general-followers.component.html',
  styleUrls: ['./general-followers.component.css']
})
export class GeneralFollowersComponent implements OnInit {

  followers:Array<Object> = [];
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
        this.followers.map((element,index)=>{
          if (element['followFrom'].id == id){
            this.followers[index]['followFrom']['isMutualFollow'] = true;
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
        this.followers.map((element,index)=>{
          if (element['followFrom'].id == id){
            this.followers[index]['followFrom']['isMutualFollow'] = false;
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
    this.updateFolowers()
  }
  updateFolowers(){
    this.userService.getFollowers(this.lastDocId)
      .subscribe((data: any) => {
        console.log('this.userService.getFollowers', data);
        const { docs, total, limit, page, lastDocId } = data;
        //this.hasMore = (total > limit * page);
        this.lastDocId = lastDocId;
        this.isLoading = false;
        this.followers = this.followers.concat(docs);
      }, (err) => {
        console.log(err);
        this.isLoading = false;
        this.hasMore = false;
      });
  }

  ngOnInit() {
    this.updateFolowers()
  }
}
