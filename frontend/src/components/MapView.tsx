import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Plus, Navigation, Menu, X, MapPin, Layers, Filter, Wind } from 'lucide-react';
import { HeatmapLayer } from './HeatmapLayer';
import { ReportMarkers } from './ReportMarkers';
import { LocationInfo } from './LocationInfo';
import { Badge } from './ui/badge';
import type { User, Report } from '../App';
import { reportsService } from '../services';
import { InfoCard } from './InfoCard';


type MapViewProps = {
  user: User | null;
  onReportClick: () => void;
  onLocationSelect: (location: { lat: number; lng: number } | null) => void;
  selectedLocation: { lat: number; lng: number } | null;
  isSidebarOpen: boolean;
  onSidebarToggle: () => void;
  onShowLoginPrompt?: () => void;
};

export function MapView({ user, onReportClick, onLocationSelect, selectedLocation, isSidebarOpen, onSidebarToggle, onShowLoginPrompt }: MapViewProps) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: 10.7769, // Sài Gòn
    lng: 106.7009,
  });
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showLocationInfo, setShowLocationInfo] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [isLegendExpanded, setIsLegendExpanded] = useState(false);

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Fallback to Sài Gòn
          setUserLocation({ lat: 10.7769, lng: 106.7009 });
        }
      );
    }
  };

  useEffect(() => {
    handleLocateMe();
    loadReports();
  }, []);

  // Load reports from API
  const loadReports = async () => {
    try {
      setIsLoadingReports(true);
      const response = await reportsService.getReports({
        limit: 100,
      });
      setReports(response.results);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setIsLoadingReports(false);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    onLocationSelect({ lat, lng });
    setShowLocationInfo(true);
  };

  const handleReportMarkerClick = (report: Report) => {
    setSelectedReport(report);
    onLocationSelect({ lat: report.lat, lng: report.lng });
    setShowLocationInfo(true);
  };

  // Calculate current area air quality
  const nearbyReports = reports.filter(r => 
    r.type === 'air' && 
    Math.abs(r.lat - userLocation.lat) < 0.01 && 
    Math.abs(r.lng - userLocation.lng) < 0.01
  );

  return (
    <div className="relative w-full h-full">
      {/* Map Container */}
      <div className="w-full h-full bg-gradient-to-br from-blue-50 via-slate-50 to-green-50 relative overflow-hidden">
        {/* Heatmap Visualization */}
        {showHeatmap && <HeatmapLayer reports={reports} />}
        
        {/* Report Markers */}
        {showMarkers && (
          <ReportMarkers 
            reports={reports} 
            onMarkerClick={handleReportMarkerClick}
            selectedReport={selectedReport}
          />
        )}

        {/* User Location Marker */}
        <div 
          className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2"
          style={{ 
            left: `${((userLocation.lng - 106.65) / 0.15) * 100}%`,
            top: `${((10.85 - userLocation.lat) / 0.15) * 100}%`
          }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75 w-6 h-6 -left-3 -top-3"></div>
            <div className="absolute inset-0 bg-blue-400 rounded-full opacity-50 w-8 h-8 -left-4 -top-4 blur-md"></div>
            <MapPin className="w-8 h-8 text-blue-600 drop-shadow-lg relative z-10" fill="currentColor" />
          </div>
        </div>

        {/* Selected Location Marker */}
        {selectedLocation && (
          <div 
            className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2"
            style={{ 
              left: `${((selectedLocation.lng - 106.65) / 0.15) * 100}%`,
              top: `${((10.85 - selectedLocation.lat) / 0.15) * 100}%`
            }}
          >
            <MapPin className="w-8 h-8 text-red-600 drop-shadow-lg animate-bounce" fill="currentColor" />
          </div>
        )}

        {/* Grid overlay for visual reference */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="w-full h-full grid grid-cols-10 grid-rows-10 gap-px">
            {Array.from({ length: 100 }).map((_, i) => (
              <div key={i} className="border border-gray-400"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Status Bar - Mobile Left */}
      <div className="absolute md:top-6 top-4 md:left-1/2 left-4 md:-translate-x-1/2 translate-x-0 z-30">
        <div className="bg-white/95 backdrop-blur-xl md:rounded-2xl rounded-xl shadow-lg border border-gray-200/50 md:px-6 md:py-3 px-3 py-2 flex items-center md:gap-6 gap-3">
          <div className="flex items-center md:gap-2 gap-1.5">
            <div className="md:w-3 md:h-3 w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="md:text-sm text-xs">Live</span>
          </div>
          <div className="md:h-4 h-3 w-px bg-gray-300"></div>
          <div className="flex items-center md:gap-2 gap-1.5">
            <span className="md:text-sm text-xs text-gray-600 md:inline hidden">Vị trí của bạn:</span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 md:text-xs text-[10px] md:px-2.5 px-2 md:py-0.5 py-0">
              {nearbyReports.length > 0 ? 'Trung bình' : 'Tốt'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Menu Toggle Button - Mobile Only (Below Status Bar) - Only show when logged in */}
      {user && (
        <Button
          onClick={onSidebarToggle}
          size="icon"
          className="absolute top-20 left-4 z-30 md:hidden bg-white/95 backdrop-blur-xl text-gray-800 hover:bg-gray-100 shadow-lg rounded-xl w-12 h-12 border border-gray-200/50"
          variant="outline"
        >
          <Menu className="w-5 h-5" />
        </Button>
      )}

      {/* Auth Buttons for Guest Users - Bottom Left */}
      {!user && (
        <div className="absolute md:bottom-8 bottom-6 md:left-8 left-4 z-30 flex gap-2">
          <Button
            onClick={() => onShowLoginPrompt?.()}
            size="sm"
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg rounded-xl md:px-5 px-4 md:h-11 h-10 border-0"
          >
            <span className="text-white md:text-sm text-xs">Đăng nhập / Đăng ký</span>
          </Button>
        </div>
      )}

      {/* Control Buttons - Moved to Right Edge on Mobile */}
      <div className="absolute md:bottom-8 md:right-8 bottom-6 right-4 flex flex-col gap-3 z-30">
        {/* Layer Controls Group */}
        <div className="flex flex-col gap-2 bg-white/95 backdrop-blur-xl rounded-2xl p-2 shadow-xl border border-gray-200/50">
          <Button
            onClick={() => setShowHeatmap(!showHeatmap)}
            size="lg"
            className={`md:rounded-xl rounded-lg md:h-12 h-10 md:px-3 px-2.5 shadow-sm transition-all ${
              showHeatmap 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 border-0' 
                : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
            }`}
            variant={showHeatmap ? "default" : "outline"}
          >
            <Layers className="md:w-4 md:h-4 w-3.5 h-3.5 md:mr-2 mr-0" />
            <span className="md:text-xs text-[10px] md:inline hidden">Heatmap</span>
          </Button>

          <Button
            onClick={() => setShowMarkers(!showMarkers)}
            size="lg"
            className={`md:rounded-xl rounded-lg md:h-12 h-10 md:px-3 px-2.5 shadow-sm transition-all ${
              showMarkers 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 border-0' 
                : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
            }`}
            variant={showMarkers ? "default" : "outline"}
          >
            <MapPin className="md:w-4 md:h-4 w-3.5 h-3.5 md:mr-2 mr-0" />
            <span className="md:text-xs text-[10px] md:inline hidden">Markers</span>
          </Button>
        </div>

        <Button
          onClick={handleLocateMe}
          size="lg"
          className="md:rounded-2xl rounded-xl md:w-14 md:h-14 w-12 h-12 shadow-xl bg-white/95 backdrop-blur-xl text-blue-600 hover:bg-blue-50 border border-blue-200/50"
          variant="outline"
        >
          <Navigation className="md:w-5 md:h-5 w-4 h-4" />
        </Button>
        
        <Button
          onClick={() => {
            if (!user && onShowLoginPrompt) {
              onShowLoginPrompt();
            } else {
              onReportClick();
            }
          }}
          size="lg"
          className="md:rounded-2xl rounded-xl md:w-14 md:h-14 w-12 h-12 shadow-xl bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 border-0 shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all hover:scale-105"
        >
          <Plus className="md:w-6 md:h-6 w-5 h-5 text-white" />
        </Button>
      </div>

      {/* Location Info Panel */}
      {showLocationInfo && selectedLocation && (
        <LocationInfo
          location={selectedLocation}
          reports={reports.filter(
            r => Math.abs(r.lat - selectedLocation.lat) < 0.01 && 
                 Math.abs(r.lng - selectedLocation.lng) < 0.01
          )}
          selectedReport={selectedReport}
          onClose={() => {
            setShowLocationInfo(false);
            setSelectedReport(null);
            onLocationSelect(null);
          }}
          onReportUpdate={loadReports}
          onShowLoginPrompt={!user ? onShowLoginPrompt : undefined}
        />
      )}

      {/* Enhanced Legend - Refined Design */}
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-lg shadow-gray-900/5 z-10 border border-gray-200/60 w-64 md:p-4 p-3 md:w-64 w-auto max-w-[90vw] overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 via-transparent to-teal-50/20 pointer-events-none"></div>
        
        <div className="relative">
          {/* Desktop Header */}
          <div className="md:flex items-center justify-between md:mb-3.5 md:pb-3 md:border-b border-gray-200/60 hidden">
            <div>
              <h3 className="text-gray-900 text-sm mb-0.5 tracking-tight">Chỉ số AQI</h3>
              <p className="text-xs text-gray-500">Chất lượng không khí</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/25">
              <Wind className="w-4 h-4 text-white" />
            </div>
          </div>
        
          {/* Mobile Header - Collapsible */}
          <button 
            onClick={() => setIsLegendExpanded(!isLegendExpanded)}
            className="md:hidden flex items-center justify-between w-full mb-2.5 p-1 rounded-lg hover:bg-gray-50/80 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
                <Filter className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="text-left">
                <div className="text-xs text-gray-900 tracking-tight">Chỉ số AQI</div>
                <div className="text-[10px] text-gray-500">Chất lượng KK</div>
              </div>
            </div>
            <div className={`transition-transform duration-200 ${isLegendExpanded ? 'rotate-180' : ''}`}>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
        
          <div className={`space-y-1.5 transition-all duration-300 ${isLegendExpanded ? 'block' : 'md:block hidden'}`}>
            {/* Good (0-50) */}
            <InfoCard value="0-50" label="Tốt" icon="😊" variant="green" />
            <InfoCard value="51-100" label="Trung bình" icon="😐" variant="yellow" />
            <InfoCard value="101-150" label="Kém" icon="😷" variant="orange" />
            <InfoCard value="151-200" label="Xấu" icon="😨" variant="red" />
            <InfoCard value="200+" label="Nguy hại" icon="☠️" variant="purple" />
          </div>
        </div>
      </div>
    </div>
  );
}