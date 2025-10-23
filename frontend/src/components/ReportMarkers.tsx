import { Smile, Frown, Skull, AlertTriangle, Volume2, VolumeX } from 'lucide-react';
import { AIR_LEVEL, NOISE_LEVEL, type Report } from '../App';


type ReportMarkersProps = {
  reports: Report[];
  onMarkerClick: (report: Report) => void;
  selectedReport: Report | null;
};

export function ReportMarkers({ reports, onMarkerClick, selectedReport }: ReportMarkersProps) {

  const getAirIcon = (level?: AIR_LEVEL) => {
    switch (level) {
      case 1:
        return <Smile className="w-5 h-5 text-green-600" />;
      case 2:
        return <Smile className="w-5 h-5 text-yellow-600" />;
      case 3:
        return <Frown className="w-5 h-5 text-orange-600" />;
      case 4:
        return <AlertTriangle className="w-5 h-5 text-red-600" />;  
      case 5:
        return <Skull className="w-5 h-5 text-purple-600" />;
      default:
        return <Smile className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNoiseIcon = (level?: NOISE_LEVEL) => {
    switch (level) {
      case 1:
        return <VolumeX className="w-5 h-5 text-green-600" />;
      case 2:
        return <Volume2 className="w-5 h-5 text-yellow-600" />;
      case 3:
        return <Volume2 className="w-5 h-5 text-orange-600" />;
      case 4:
        return <Volume2 className="w-5 h-5 text-red-600" />;
      default:
        return <Volume2 className="w-5 h-5 text-gray-600" />;
    }
  };

  const getBgColor = (level?: AIR_LEVEL|NOISE_LEVEL) => {
    if (typeof level === typeof AIR_LEVEL) {
      switch (level) {
        case 1: return 'bg-green-100 border-greentypeo';
        case 2: return 'bg-yellow-100 border-yellow-400';
        case 3: return 'bg-orange-100 border-orange-400';
        case 4: return 'bg-red-100 border-red-400';
        case 5: return 'bg-purple-100 border-purple-400';
        default: return 'bg-gray-100 border-gray-400';
      }
    } else {
      switch (level) {
        case 1: return 'bg-green-100 border-green-400';
        case 2: return 'bg-yellow-100 border-yellow-400';
        case 3: return 'bg-orange-100 border-orange-400';
        case 4: return 'bg-red-100 border-red-400';
        default: return 'bg-gray-100 border-gray-400';
      }
    }
  };

  return (
    <>
      {reports.map((report) => {
        const isSelected = selectedReport?.id === report.id;
        const bgColor = getBgColor(
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
