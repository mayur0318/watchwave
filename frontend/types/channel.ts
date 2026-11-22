export interface ChannelProfile {
  _id: string;
  userName: string;
  fullName: string;
  avatar: string;
  coverImage: string;
  subscribersCount: number;
  channelSubscribedToCount: number;
  isSubscribed: boolean;
}
