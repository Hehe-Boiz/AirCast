import { Smile, Frown, Skull, AlertTriangle, Volume2, VolumeX } from 'lucide-react';
import type { Report } from '../App';

type ReportMarkersProps = {
  reports: Report[];
  onMarkerClick: (report: Report) => void;
  selectedReport: Report | null;
};

export function ReportMarkers({ reports, onMarkerClick, selectedReport }: ReportMarkersProps) {
  const getAirIcon = (level?: string) => {
    switch (level) {
      case 'good':
        return <Smile className="w-5 h-5 text-green-600" />;
      case 'moderate':
        return <Smile className="w-5 h-5 text-yellow-600" />;
      case 'unhealthy':
        return <Frown className="w-5 h-5 text-orange-600" />;
      case 'very_unhealthy':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'hazardous':
        return <Skull className="w-5 h-5 text-purple-600" />;
      default:
        return <Smile className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNoiseIcon = (level?: string) => {
    switch (level) {
      case 'quiet':
        return <VolumeX className="w-5 h-5 text-green-600" />;
      case 'moderate':
        return <Volume2 className="w-5 h-5 text-yellow-600" />;
      case 'loud':
        return <Volume2 className="w-5 h-5 text-orange-600" />;
      case 'very_loud':
        return <Volume2 className="w-5 h-5 text-red-600" />;
      default:
        return <Volume2 className="w-5 h-5 text-gray-600" />;
    }
  };

  const getBgColor = (type: string, level?: string) => {
    if (type === 'air') {
      switch (level) {
        case 'good': return 'bg-green-100 border-green-400';
        case 'moderate': return 'bg-yellow-100 border-yellow-400';
        case 'unhealthy': return 'bg-orange-100 border-orange-400';
        case 'very_unhealthy': return 'bg-red-100 border-red-400';
        case 'hazardous': return 'bg-purple-100 border-purple-400';
        default: return 'bg-gray-100 border-gray-400';
      }
    } else {
      switch (level) {
        case 'quiet': return 'bg-green-100 border-green-400';
        case 'moderate': return 'bg-yellow-100 border-yellow-400';
        case 'loud': return 'bg-orange-100 border-orange-400';
        case 'very_loud': return 'bg-red-100 border-red-400';
        default: return 'bg-gray-100 border-gray-400';
      }
    }
  };

  return (
    <>
      {reports.map((report) => {
        const isSelected = selectedReport?.id === report.id;
        const bgColor = getBgColor(
          report.type,
          report.type === 'air' ? report.airQuality : report.noiseLevel
        );

        return (
          <div
            key={report.id}
            className="absolute z-10 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            style={{
              left: `${((report.lng - 106.65) / 0.15) * 100}%`,
              top: `${((10.85 - report.lat) / 0.15) * 100}%`,
            }}
            onClick={() => onMarkerClick(report)}
          >
            <div
              className={`p-2 rounded-full border-2 shadow-lg transition-all hover:scale-110 ${bgColor} ${
                isSelected ? 'ring-4 ring-blue-500 scale-125' : ''
              }`}
            >
              {report.type === 'air'
                ? getAirIcon(report.airQuality)
                : getNoiseIcon(report.noiseLevel)}
            </div>
          </div>
        );
      })}
    </>
  );
}
