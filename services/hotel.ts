import { api } from "./request";
import type { ApiResponse, HotelDetail, HotelPoi } from "@/types/hotel";
import { getQualityParams } from "@/utils/getImageQuality";

export interface GetHotelDetailParams {
  hotelId: number;
  checkIn: string;
  checkOut: string;
}

/** 用户端 - 酒店详情 */
export async function getHotelDetail(
  params: GetHotelDetailParams
): Promise<HotelDetail> {
  const { hotelId, checkIn, checkOut } = params;
  const qs = new URLSearchParams({ check_in: checkIn, check_out: checkOut });
  const res = await api.get<ApiResponse<HotelDetail>>(
    `/api/hotel/${hotelId}?${qs}`
  );
  if (res.code !== 200) {
    throw new Error(res.message || "获取酒店详情失败");
  }

  const data = res.data;

  // 获取质量参数，只调用一次
  const qualityParams = getQualityParams();
  
  // 处理图片列表
  if (data.images && Array.isArray(data.images)) {
    data.images = data.images.map((img) => {
      // 确保 img 对象有 url 字段
      if (img && typeof img === 'object' && img.url) {
        return {
          ...img,
          url: img.url + qualityParams
        };
      }
      return img;
    });
  }


  return res.data;
}

export interface HotelListItem {
  hotel_id: number;
  name: string;
  star: number | null;
  rating: number;
  review_count: number;
  address: string;
  opening_date: string | null;
  latitude?: number;
  longitude?: number;
  cover_image: string;
  lowest_price: number;
  facilities: string[];
}

export interface GetHotelListParams {
  city?: string;
  keyword?: string;
  check_in: string;
  check_out: string;
  star_min?: number;
  star_max?: number;
  price_min?: number;
  price_max?: number;
  facility_ids?: number[];
  sort?: "price_asc" | "price_desc" | "rating_desc";
  page?: number;
  size?: number;
}

/** 用户端 - 酒店列表 */
export async function getHotelList(
  params: GetHotelListParams
): Promise<HotelListItem[]> {
  const qs = new URLSearchParams();
  if (params.check_in) qs.set("check_in", params.check_in);
  if (params.check_out) qs.set("check_out", params.check_out);
  if (params.city) qs.set("city", params.city);
  if (params.keyword) qs.set("keyword", params.keyword);
  if (params.star_min != null) qs.set("star_min", String(params.star_min));
  if (params.star_max != null) qs.set("star_max", String(params.star_max));
  if (params.price_min != null) qs.set("price_min", String(params.price_min));
  if (params.price_max != null) qs.set("price_max", String(params.price_max));
  if (params.facility_ids?.length)
    qs.set("facility_ids", params.facility_ids.join(","));
  if (params.sort) qs.set("sort", params.sort);
  if (params.page != null) qs.set("page", String(params.page));
  if (params.size != null) qs.set("size", String(params.size));

  const res = await api.get<ApiResponse<HotelListItem[]>>(
    `/api/hotels?${qs}`
  );
  if (res.code !== 200) {
    throw new Error(res.message || "获取酒店列表失败");
  }
  return Array.isArray(res.data) ? res.data : [];
}

/** 用户端 - 酒店周边 POI 列表 */
export async function getHotelPoi(hotelId: number): Promise<HotelPoi[]> {
  const res = await api.get<ApiResponse<HotelPoi[]>>(`/api/hotel/${hotelId}/poi`);
  if (res.code !== 200) {
    throw new Error(res.message || "获取酒店POI失败");
  }
  return Array.isArray(res.data) ? res.data : [];
}
