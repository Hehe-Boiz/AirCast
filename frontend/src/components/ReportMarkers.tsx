import { Smile, Frown, Skull, AlertTriangle, Volume2, VolumeX } from 'lucide-react';
import { type Report } from '../App';
import { AIR_LEVEL, NOISE_LEVEL } from '../types/api';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

type ReportMarkersProps = {
  reports: Report[];
  onMarkerClick: (report: Report) => void;
  selectedReport: Report | null;
};

export function ReportMarkers({ reports, onMarkerClick, selectedReport }: ReportMarkersProps) {
  if (!reports || reports.length === 0) {
    return null; 
  }
const getAirIcon = (level?: AIR_LEVEL) => {
  switch (level) {
    case 1: return '😊';
    case 2: return '😐';
    case 3: return '😷';
    case 4: return '😨';
    case 5: return '☠️';
    default: return '❓';
  }
};

const getNoiseIcon = (level?: NOISE_LEVEL) => {
  switch (level) {
    case 1: return '🤫';
    case 2: return '🙂';
    case 3: return '😠';
    case 4: return '😡';
    default: return '❓';
  }
};

const createMarkerIcon = (report: Report, isSelected: boolean) => {
  const icon = report.type === 'air' ? getAirIcon(report.airQuality) : getNoiseIcon(report.noiseLevel);
  const selectedClass = isSelected ? 'selected' : '';

  return L.divIcon({
    html: `<div class="report-marker ${selectedClass}">${icon}</div>`,
    className: 'bg-transparent border-0',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};
  return (
    <>
     {reports.map((report) => {
        const isSelected = selectedReport?.id === report.id;
        return (
          <Marker
            key={report.id}
            position={[report.lat, report.lng]}
            icon={createMarkerIcon(report, isSelected)}
            eventHandlers={{
              click: () => {
                onMarkerClick(report);
              },
            }}
          >
            <Popup>
              <div>
                <p><strong>{report.type === 'air' ? 'Chất lượng không khí' : 'Mức độ tiếng ồn'}</strong></p>
                <p>Bởi: {report.userName}</p>
                {report.comment && <p>Bình luận: {report.comment}</p>}
              </div>
            </Popup>
          </Marker>
        );
      })} 
    </>
  );
}
