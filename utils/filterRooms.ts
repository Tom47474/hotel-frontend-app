import type { HotelRoom } from '@/types/hotel';

export function filterRoomsByType(rooms: HotelRoom[], filterKey: string | null): HotelRoom[] {
    if (!filterKey || filterKey === '筛选') return rooms;

    return rooms.filter((room) => {
        const name = room.name ?? "";
        const bedType = (room.bed_type ?? "").toLowerCase();

        switch (filterKey) {
            case "双床房":
                return bedType.includes("双床") || name.includes("双床");
            case "大床房":
                return bedType.includes("大床") || name.includes("大床");
            case "含早餐":
                return name.includes("早餐") || name.includes("含早");
            case "双份早餐":
                return name.includes("双早") || name.includes("双份早餐");
            default:
                return true;
        }
    })
} 