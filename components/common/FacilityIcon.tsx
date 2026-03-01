'use client'

import { FACILITY_ICON_MAP, DEFAULT_FACILITY_ICON } from '@/constants/facilityIcons'

interface FacilityIconProps {
    name: string;
    size?: number;
    className?: string;
}

export function FacilityIcon({ name, className = "gap-2", size = 28 }: FacilityIconProps) {
    const iconClass = FACILITY_ICON_MAP[name] ?? DEFAULT_FACILITY_ICON;
    return (
        <i className={`iconfont ${iconClass} text-blue-500 ${className}`}
        style={{ fontSize: `${size}px` }}
        aria-hidden></i>
    )
}