import { Component, Input, OnInit } from '@angular/core';
var moment = require('moment');

@Component({
  selector: 'chat-display-message-request',
  templateUrl: './chat-display-message-request.component.html',
  styleUrls: ['./chat-display-message-request.component.css']
})
export class ChatDisplayMessageRequestComponent {

  private moment: any = moment;
  @Input() item: any;
  @Input() chatUser: any;
  @Input() chatPartner: any;
  @Input('userId') userId: string;
  @Input() user: any;
  @Input() last: boolean;
  @Input() showRequest: Function;

  constructor() {

  }


}
