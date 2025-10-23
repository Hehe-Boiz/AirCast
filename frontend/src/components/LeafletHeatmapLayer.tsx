// src/components/LeafletHeatmapLayer.tsx
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat'; // Import plugin leaflet.heat
import { Report} from '../App'; // Import kiểu dữ liệu
import { AIR_LEVEL, NOISE_LEVEL } from '../types/api';

// Hàm tính cường độ (intensity) dựa trên chất lượng không khí
const getAirIntensity = (level?: AIR_LEVEL): number => {
  switch (level) {
    case AIR_LEVEL.GOOD: return 0.2;
    case AIR_LEVEL.MODERATE: return 0.4;
    case AIR_LEVEL.UNHEALTHY: return 0.6;
    case AIR_LEVEL.VERY_UNHEALTHY: return 0.8;
    case AIR_LEVEL.HAZARDOUS: return 1.0;
    default: return 0.1; // Giá trị mặc định thấp
  }
};

// Hàm tính cường độ (intensity) dựa trên mức độ tiếng ồn (ví dụ)
const getNoiseIntensity = (level?: NOISE_LEVEL): number => {
  switch (level) {
    case NOISE_LEVEL.QUITE: return 0.1;
    case NOISE_LEVEL.MODERATE: return 0.4;
    case NOISE_LEVEL.LOUND: return 0.7;
    case NOISE_LEVEL.VERY_LOUND: return 1.0;
    default: return 0.1;
  }
};

type LeafletHeatmapLayerProps = {
  reports: Report[];
  reportType: 'air' | 'noise'; // Chọn loại dữ liệu để hiển thị
  options?: L.HeatMapOptions; // Tùy chọn cho heatmap
};

export function LeafletHeatmapLayer({ reports, reportType, options }: LeafletHeatmapLayerProps) {
  const map = useMap(); // Lấy đối tượng map từ react-leaflet
  if(reports){
  useEffect(() => {
    if (!map || reports.length === 0) return;

    // 1. Định dạng dữ liệu: [latitude, longitude, intensity]
    const heatData: L.HeatLatLngTuple[] = reports
      .filter(r => r.type === reportType) // Lọc theo loại báo cáo
      .map(report => {
        const intensity = reportType === 'air'
          ? getAirIntensity(report.airQuality)
          : getNoiseIntensity(report.noiseLevel);
        return [report.lat, report.lng, intensity];
      });

    // 2. Tạo Heatmap Layer
    const heatLayer = (L as any).heatLayer(heatData, {
      radius: 25,
      blur: 15,
      maxZoom: 18,
      max: 1.0, // Giá trị intensity tối đa (0.0 -> 1.0)
      ...(options || {}), // Ghi đè bằng options tùy chỉnh nếu có
    });

    // 3. Thêm layer vào bản đồ
    heatLayer.addTo(map);

    // 4. Cleanup: Xóa layer khi component unmount hoặc dữ liệu thay đổi
    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, reports, reportType, options]); // Chạy lại effect khi map, reports, reportType hoặc options thay đổi
  }
  return null; // Component này không render gì cả, chỉ thêm layer vào map
}