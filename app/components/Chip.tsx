"use client";

type Props = {
  label: string;
  selected?: boolean;
  onClick?: () => void;
};

export function Chip({ label, selected = false, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-full border px-3 py-1 text-xs font-medium transition " +
        (selected
          ? "border-blue-300 bg-blue-600 text-white"
          : "border-slate-200 bg-white text-slate-700 hover:bg-blue-50")
      }
      aria-pressed={selected}
    >
      {label}
    </button>
  );
}