"use client";

const DEFAULT_FILTERS = [
  "双床房",
  "含早餐",
  "单人房",
  "大床房",
];

interface RoomTypeFiltersProps {
  filters?: string[];
  active?: string;
  onFilter?: (key: string) => void;
}

export function RoomTypeFilters({
  filters = DEFAULT_FILTERS,
  active,
  onFilter,
}: RoomTypeFiltersProps) {
  return (
    <div className="flex overflow-x-auto scrollbar-hide gap-2 px-4 py-3 bg-white border-t border-zinc-100">
      {filters.map((f) => (
        <button
          key={f}
          type="button"
          onClick={() => onFilter?.(f)}
          className={`flex-shrink-0 px-3 py-1.5 text-sm rounded-full border ${
            active === f
              ? "border-blue-500 bg-blue-50 text-blue-600"
              : "border-zinc-200 text-zinc-700 bg-white"
          }`}
        >
          {f}
        </button>
      ))}
    </div>
  );
}
