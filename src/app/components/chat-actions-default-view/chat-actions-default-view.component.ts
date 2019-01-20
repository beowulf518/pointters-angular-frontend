import { Component, Input, OnInit } from '@angular/core';
import { ConversationService } from '../../services/conversation.service';
import turf from "@turf/distance";

@Component({
  selector: 'chat-actions-default-view',
  templateUrl: './chat-actions-default-view.component.html',
  styleUrls: ['./chat-actions-default-view.component.css']
})
export class ChatActionsDefaultViewComponent {
  @Input() conversationPartner: any;
  @Input('user') user: any;
  // @Input('dropdownMode') dropdownMode: boolean;
  // @Input('startConversation') startConversation: any;

  private actionsOffers: any;
  private actionsReqsts: any;
  private actionsOrders: any;

  public turf = turf;

  constructor(
    private conversationService: ConversationService,
  ) { }
  loadMoreOffers() {
    let token = this.actionsOffers.next.replace('?id', '&id')
    this.conversationService.getMoreOffersWithUser(token)
      .then(
        res => {
          console.log(res);
          this.actionsOffers.offers = this.actionsOffers.offers.concat(res['offers']);
        }
      )
    console.log('HI!!!');
  }
  ngOnChanges(changes) {
    console.log('changes default', changes)
    if (changes.conversationPartner.currentValue) {
      let userId = changes.conversationPartner.currentValue;
      this.conversationService.getOffersWithUser(userId)
        .then(res => {
          this.actionsOffers = res;
        })
        .catch(err=>{
          console.log('Error',err)
          this.actionsOffers = {offers:[]};
        })
      this.conversationService.getReuqestsWithUser(userId)
        .then(res => {
          this.actionsReqsts = res;
        })
        .catch(err=>{
          console.log('Error',err)
            this.actionsReqsts =[]
        })
      this.conversationService.getOrdersWithUser(userId)
        .then(res => {
          this.actionsOrders = res;
        })
        .catch(err=>{
          console.log('Error',err)
           this.actionsOrders = {docs:[]};
        })
    }

  }
}
