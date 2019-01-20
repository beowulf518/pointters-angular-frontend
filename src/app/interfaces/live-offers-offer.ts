
import { Location } from "./location";
import { Media } from "./media";
import { User } from "./user";

interface liveOffer {
  offerId?: string;
  currencySymbol?: string;
  currencyCode?: string;
  description?: string;
  price?: number;
  workDuration?: number;
  workDurationUom: string;
  media: Media;
  location: Location;
  seller: User;


  status?: string;
  priceDescription: string;
  notificationCount: number;
}
export interface liveOfferIncoming {
  result: liveOffer
}


