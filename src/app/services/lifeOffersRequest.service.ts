import { resolve } from 'dns';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import {
  Observable
} from 'rxjs/Observable';
import {
  of
} from 'rxjs/observable/of';
import {
  catchError,
  map,
  tap
} from 'rxjs/operators';

import { AuthService } from './auth.service';
import { lifeOffersRequestService } from './lifeOffersSocket.service';
import { UserService } from './user.service';
import { ChatUser } from './../interfaces/chat-user';
import { Paginated } from './../interfaces/paginated';
import { JoinRoom } from './../interfaces/live-offers-join-room';
import { liveOfferError } from './../interfaces/live-offers-error';
import { liveOfferIncoming } from './../interfaces/live-offers-offer';

import { environment } from './../../environments/environment';


@Injectable()
export class lifeOffersSocketService {
  private apiUrl = environment.apiUrl;
  public conversations: Paginated;
  public userId: string;
  public currentChatPartner: ChatUser;
  private socket: lifeOffersRequestService;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private userService: UserService
  ) {

  }

  initSocket = () => {
    this.socket = new lifeOffersRequestService(this.authService.token);
  }

  /**
   * Join live offer room
   *
   * @param userId: string
   * @memberof lifeOffersSocketService
   */
  joinLiveOfferRoom(requestId: string) {

    let data = { "requestId": requestId };
    this.socket.emit("join_live_offer_room", data);
  }

  /**
   * add join live offer room listener
   *
   * @memberof lifeOffersSocketService
   */
  addJoinLiveOfferRoomListener() {
    return this.socket
      .fromEvent<JoinRoom>("join_live_offer_room")
      .map(data => data);
  }

  /**
   * add live offer error listener
   *
   * @memberof lifeOffersSocketService
   */
  addLiveOfferErrorListener() {
    return this.socket
      .fromEvent<liveOfferError>("error")
      .map(data => data)
  }
  /**
   * add live offer error listener
   *
   * @memberof lifeOffersSocketService
   */
  addliveOfferListener() {
    return this.socket
      .fromEvent<liveOfferIncoming>("live_offer")
      .map(data => data)
  }
}

