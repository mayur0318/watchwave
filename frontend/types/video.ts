export interface VideoOwner {
  _id: string;
  fullName: string;
  userName: string;
  avatar: string;
}

export interface Video {
  _id: string;
  videoFile: string;
  thumbnail: string;
  title: string;
  description: string;
  duration: number;
  views: number;
  isPublished: boolean;
  owner: VideoOwner | null;
  createdAt: string;
  updatedAt: string;
}

export interface VideoDetail extends Video {
  likesCount: number;
  isLiked: boolean;
  subscribersCount: number;
  isSubscribed: boolean;
}
