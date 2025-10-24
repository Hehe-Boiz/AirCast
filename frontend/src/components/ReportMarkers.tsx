// src/components/ReportMarkers.tsx
import { Marker } from 'react-leaflet';
import L from 'leaflet';
import { useRef } from 'react';
import { type Report, AIR_LEVEL, NOISE_LEVEL } from '../App';

// ---- Icon helpers (không phụ thuộc Component.name) ----
type IconKey = 'smile' | 'frown' | 'alertTriangle' | 'skull' | 'volume2' | 'volumeX';

const getAirIconKey = (level?: AIR_LEVEL): { key: IconKey; className: string } => {
  switch (level) {
    case 1: return { key: 'smile', className: 'w-5 h-5 text-green-600' };
    case 2: return { key: 'smile', className: 'w-5 h-5 text-yellow-600' };
    case 3: return { key: 'frown', className: 'w-5 h-5 text-orange-600' };
    case 4: return { key: 'alertTriangle', className: 'w-5 h-5 text-red-600' };
    case 5: return { key: 'skull', className: 'w-5 h-5 text-purple-600' };
    default: return { key: 'smile', className: 'w-5 h-5 text-gray-600' };
  }
};

const getNoiseIconKey = (level?: NOISE_LEVEL): { key: IconKey; className: string } => {
  switch (level) {
    case 1: return { key: 'volumeX', className: 'w-5 h-5 text-green-600' };
    case 2: return { key: 'volume2', className: 'w-5 h-5 text-yellow-600' };
    case 3: return { key: 'volume2', className: 'w-5 h-5 text-orange-600' };
    case 4: return { key: 'volume2', className: 'w-5 h-5 text-red-600' };
    default: return { key: 'volume2', className: 'w-5 h-5 text-gray-600' };
  }
};

// Màu nền theo level (dùng chung cho air/noise)
const getBgColor = (level?: number): string => {
  switch (level) {
    case 1: return 'bg-green-100 border-green-400';
    case 2: return 'bg-yellow-100 border-yellow-400';
    case 3: return 'bg-orange-100 border-orange-400';
    case 4: return 'bg-red-100 border-red-400';
    case 5: return 'bg-purple-100 border-purple-400';
    default: return 'bg-gray-100 border-gray-400';
  }
};

// SVG body cho từng IconKey (không cần renderToStaticMarkup)
const svgContentMap: Record<IconKey, string> = {
  smile: `
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" x2="9.01" y1="9" y2="9" />
    <line x1="15" x2="15.01" y1="9" y2="9" />
  `,
  frown: `
    <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
    <line x1="9" x2="9.01" y1="9" y2="9" />
    <line x1="15" x2="15.01" y1="9" y2="9" />
  `,
  alertTriangle: `
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0" />
    <line x1="12" y1="10" x2="12" y2="14" />
    <line x1="12" y1="16" x2="12.01" y2="16" />

  `,
  skull: `
    <line x1="10" y1="13" x2="10.01" y2="13" />
    <line x1="14" y1="13" x2="14.01" y2="13" />
    <path d="M12 16L12 16" />
  `,
  volume2: `
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
  `,
  volumeX: `
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="22" y1="9" x2="16" y2="15" />
    <line x1="16" y1="9" x2="22" y2="15" />
  `,
};

// ---- Tạo DivIcon từ report + key ----
const buildDivIconHtml = (opts: {
  bgColorClass: string;
  iconBody: string;
  iconClass: string;
  isSelected: boolean;
}) => {
  const { bgColorClass, iconBody, iconClass, isSelected } = opts;
  return `
    <div
      class="p-2 rounded-full border-2 shadow-lg transition-all ${bgColorClass} ${
        isSelected ? 'ring-4 ring-blue-500 scale-125' : 'hover:scale-110'
      }"
      style="width:38px;height:38px;display:flex;align-items:center;justify-content:center;"
    >
      <svg xmlns="http://www.w3.org/2000/svg"
           width="20" height="20" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
           class="${iconClass}">
        <circle cx="12" cy="12" r="10" />
        ${iconBody}
      </svg>
    </div>
  `;
};

const createCustomIcon = (report: Report, isSelected: boolean) => {
  const isAir = report.type === 'air';
  const { key, className } = isAir
    ? getAirIconKey(report.air_quality)
    : getNoiseIconKey(report.noise_level);

  const bg = isAir ? getBgColor(report.air_quality) : getBgColor(report.noise_level);
  const html = buildDivIconHtml({
    bgColorClass: bg,
    iconBody: svgContentMap[key],
    iconClass: className,
    isSelected,
  });

  return L.divIcon({
    html,
    className: 'leaflet-marker-icon-custom-report',
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
};

// ---- Component ----
type ReportMarkersProps = {
  reports: Report[];
  onMarkerClick: (report: Report) => void;
  selectedReport: Report | null;
};

export function ReportMarkers({ reports, onMarkerClick, selectedReport }: ReportMarkersProps) {
  // Cache icon theo (type, level, selected) để giảm tạo lại
  const iconCacheRef = useRef<Map<string, L.DivIcon>>(new Map());

  const getCachedIcon = (report: Report, isSelected: boolean) => {
    const level = report.type === 'air' ? report.air_quality : report.noise_level;
    const cacheKey = `${report.type}|${level ?? 0}|${isSelected ? 1 : 0}`;
    const cache = iconCacheRef.current;
    let icon = cache.get(cacheKey);
    if (!icon) {
      icon = createCustomIcon(report, isSelected);
      cache.set(cacheKey, icon);
    }
    return icon;
  };

  return (
    <>
      {reports.map((report) => {
        const isSelected = selectedReport?.id === report.id;
        const icon = getCachedIcon(report, isSelected);
        return (
          <Marker
            key={report.id}
            position={[report.lat, report.lng]}
            icon={icon}
            eventHandlers={{ click: () => onMarkerClick(report) }}
          />
        );
      })}
    </>
  );
}
