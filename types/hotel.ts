/** 酒店详情 - 用户端接口返回 */
export interface HotelDetail {
  hotel_id: number;
  name: string;
  star: number | null;
  rating: number;
  review_count: number;
  address: string;
  opening_date: string | null;
  description: string | null;
  contacts: HotelContact[];
  images: HotelImage[];
  facilities: string[];
  rooms: HotelRoom[];
  promotions: HotelPromotion[];
}

export interface HotelContact {
  type: "phone" | "email" | "fax" | "wechat";
  value: string;
  is_primary?: boolean;
  remark?: string;
}

export interface HotelImage {
  url: string;
  type: "cover" | "detail";
  /** 媒体类型，缺省为 image；视频时展示播放图标和静音按钮 */
  mediaType?: "image" | "video";
}

export interface HotelRoom {
  room_id: number;
  name: string;
  area: number | null;
  bed_type: string | null;
  max_guest: number | null;
  price_detail: RoomPriceDetail[];
}

export interface RoomPriceDetail {
  date: string;
  price: number;
  stock: number;
}

export interface HotelPromotion {
  promotion_id: number;
  source: "platform" | "merchant";
  type: "discount" | "minus" | "bundle";
  discount?: number;
  minus?: number;
  description?: string;
}

/** API 统一返回格式 */
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}
