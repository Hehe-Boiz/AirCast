// src/components/MapView.tsx
import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Button } from './ui/button';
import { Plus, Navigation, Menu, X, MapPin, Layers, Filter, Wind, Volume2 } from 'lucide-react'; // Thêm icon
// import { AqiHeatmapLayer } from './AqiHeatmapLayer'; // Heatmap AQI từ API /aqi/fetch
import { ReportMarkers } from './ReportMarkers'; // Giữ lại nếu bạn muốn dùng lại Marker (cần điều chỉnh)
import { LocationInfo } from './LocationInfo';
import { Badge } from './ui/badge';
import { type User, type Report, AIR_LEVEL } from '../App';
import { reportsService } from '../services';
import {InfoCard} from './InfoCard'

// Import CSS của Leaflet
import 'leaflet/dist/leaflet.css';

// Props cho MapView (giữ nguyên)
type MapViewProps = {
  user: User | null;
  onReportClick: () => void;
  onLocationSelect: (location: { lat: number; lng: number } | null) => void;
  selectedLocation: { lat: number; lng: number } | null;
  isSidebarOpen: boolean;
  onSidebarToggle: () => void;
  onShowLoginPrompt?: () => void;
};

// --- Component con để xử lý sự kiện click trên bản đồ ---
function MapClickHandler({ onClick }: { onClick: (latlng: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng);
    },
  });
  return null;
}

// --- Component con để hiển thị Marker người dùng và Marker được chọn ---
function LocationMarkers({ userLocation, selectedLocation }: {
  userLocation: L.LatLngExpression,
  selectedLocation: L.LatLngExpression | null
}) {
  // Cấu hình icon tùy chỉnh nếu cần (ví dụ)
  const userIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    // className: 'animate-pulse' // Thêm animation nếu muốn
  });

  const selectedIcon = new L.Icon({
     iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
     shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png',
     iconSize: [25, 41],
     iconAnchor: [12, 41],
     popupAnchor: [1, -34],
     shadowSize: [41, 41]
     // className: 'animate-bounce' // Thêm animation nếu muốn
  });


  return (
    <>
      <Marker position={userLocation} icon={userIcon}>
        <Popup>Vị trí hiện tại của bạn (ước tính)</Popup>
      </Marker>
      {selectedLocation && (
        <Marker position={selectedLocation} icon={selectedIcon}>
           <Popup>Vị trí bạn đã chọn</Popup>
        </Marker>
      )}
    </>
  );
}


export function MapView({
    user,
    onReportClick,
    onLocationSelect,
    selectedLocation,
    isSidebarOpen,
    onSidebarToggle,
    onShowLoginPrompt
}: MapViewProps) {
  const [userLocation, setUserLocation] = useState<L.LatLngExpression>([10.7769, 106.7009]); // Sài Gòn làm mặc định
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showLocationInfo, setShowLocationInfo] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true); // Giữ lại state này, có thể dùng cho ReportMarkers sau này
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [isLegendExpanded, setIsLegendExpanded] = useState(false);
  const [currentReportType, setCurrentReportType] = useState<'air' | 'noise'>('air'); // State để chọn loại heatmap

  // Hàm xử lý khi click vào bản đồ
  const handleMapClickInternal = (latlng: L.LatLng) => {
    onLocationSelect({ lat: latlng.lat, lng: latlng.lng });
    setSelectedReport(null); // Bỏ chọn báo cáo cụ thể khi click vào vị trí mới
    setShowLocationInfo(true);
  };

  // Hàm xử lý khi click vào marker báo cáo (nếu dùng ReportMarkers)
  const handleReportMarkerClick = (report: Report) => {
    setSelectedReport(report);
    onLocationSelect({ lat: report.lat, lng: report.lng });
    setShowLocationInfo(true);
  };

  // Lấy vị trí người dùng
  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
          console.warn("Vị trí hiện tại của người dùng")
          console.log(position.coords.latitude, position.coords.longitude);
        },
        () => {
          console.warn("Không thể lấy vị trí người dùng, sử dụng vị trí mặc định.");
          setUserLocation([10.7769, 106.7009]);
          console.log(10.7769, 106.7009);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
       console.warn("Trình duyệt không hỗ trợ Geolocation.");
    }
  };

  // Load báo cáo từ API
  const loadReports = async () => {
    try {
      setIsLoadingReports(true);
      // Lấy báo cáo trong bán kính lớn hơn một chút để heatmap có dữ liệu
      const response = await reportsService.getReports();
      setReports(response.reports);
    } catch (error) {
      console.error('Failed to load reports:', error);
      // toast.error("Không thể tải danh sách báo cáo");
    } finally {
      setIsLoadingReports(false);
    }
  };

  // Load vị trí và báo cáo khi component mount
  useEffect(() => {
    handleLocateMe();
    loadReports();
  }, []); // Chỉ chạy 1 lần khi mount

  // Vị trí trung tâm ban đầu của bản đồ
  const initialCenter: L.LatLngExpression = [10.7769, 106.7009];

  // Tính toán chất lượng không khí trung bình cho khu vực hiện tại (ví dụ)
  const nearbyReports = reports.filter(r =>
      Array.isArray(userLocation) &&
      r.type === 'air' &&
      Math.abs(r.lat - userLocation[0]) < 0.01 && // Điều chỉnh ngưỡng nếu cần
      Math.abs(r.lng - userLocation[1]) < 0.01
  );
  const avgNearbyAQI = nearbyReports.length > 0
    ? nearbyReports.reduce((sum, r) => sum + (r.air_quality === AIR_LEVEL.GOOD ? 1 : r.air_quality === AIR_LEVEL.MODERATE ? 2 : 3), 0) / nearbyReports.length
    : 1; // Giả sử là tốt nếu không có báo cáo

  const nearbyAQIStatus = avgNearbyAQI <= 1.5 ? 'Tốt' : avgNearbyAQI <= 2.5 ? 'Trung bình' : 'Kém';

  return (
    <div className="relative w-full h-full">
      {/* Map Container */}
      <MapContainer
        center={userLocation || initialCenter} // Ưu tiên vị trí người dùng
        zoom={14} // Zoom gần hơn một chút
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', zIndex: 10 }}
        className="map-container" // Thêm class để có thể style dễ hơn
      >
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {/* Heatmap Layer - AQI (leaflet.heat) */}
        {/* {showHeatmap && (
          <AqiHeatmapLayer
            options={{
              radius: 35,
              blur: 25,
              max: 1.0
            }}
            fetchBoundsPadding={0.0}
          />
        )} */}

        {/* Markers cho vị trí người dùng và vị trí được chọn */}
        <LocationMarkers userLocation={userLocation} selectedLocation={selectedLocation ? [selectedLocation.lat, selectedLocation.lng] : null}/>

        {/* Component xử lý click */}
        <MapClickHandler onClick={handleMapClickInternal} />

        {/* Nếu muốn dùng lại ReportMarkers, cần điều chỉnh nó để dùng <Marker> */}
        {showMarkers && reports.length > 0 && (
          <ReportMarkers
             reports={reports}
             onMarkerClick={handleReportMarkerClick}
             selectedReport={selectedReport}
           />
         )}

      </MapContainer>

      {/* --- UI Controls --- */}

      {/* Top Status Bar */}
      <div className="absolute md:top-6 top-4 md:left-1/2 left-4 md:-translate-x-1/2 translate-x-0 z-30">
        <div className="bg-white/95 backdrop-blur-xl md:rounded-2xl rounded-xl shadow-lg border border-gray-200/50 md:px-6 md:py-3 px-3 py-2 flex items-center md:gap-6 gap-3">
          <div className="flex items-center md:gap-2 gap-1.5">
            <div className={`md:w-3 md:h-3 w-2.5 h-2.5 rounded-full animate-pulse ${isLoadingReports ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
            <span className="md:text-sm text-xs">{isLoadingReports ? 'Đang tải...' : 'Live'}</span>
          </div>
          <div className="md:h-4 h-3 w-px bg-gray-300"></div>
          <div className="flex items-center md:gap-2 gap-1.5">
            <span className="md:text-sm text-xs text-gray-600 md:inline hidden">Khu vực của bạn:</span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 md:text-xs text-[10px] md:px-2.5 px-2 md:py-0.5 py-0">
               {nearbyAQIStatus}
            </Badge>
          </div>
        </div>
      </div>

      {/* Menu Toggle Button (Mobile) */}
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

      {/* Auth Buttons for Guest */}
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

         {/* Control Buttons (Right Edge) */}
      <div className="absolute md:bottom-8 md:right-8 bottom-6 right-4 flex flex-col gap-3 z-30">
        {/* Layer Controls */}
        <div className="flex flex-col gap-2 bg-white/95 backdrop-blur-xl rounded-2xl p-2 shadow-xl border border-gray-200/50">
          <Button
            onClick={() => setShowHeatmap(!showHeatmap)}
            size="lg"
            className={`md:rounded-xl rounded-lg md:h-12 h-10 md:px-3 px-2.5 shadow-sm transition-all ${
              showHeatmap
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 border-0'
                : 'bg-white text-gray-500 hover:bg-gray-50  border-gray-200'
            }`}
            variant={showHeatmap ? "default" : "outline"}
            title="Bật/Tắt Heatmap"
          >
            <Layers className="md:w-4 md:h-4 w-3.5 h-3.5 md:mr-2 mr-0" />
            <span className="md:text-xs text-[10px] md:inline hidden">Heatmap</span>
          </Button>

          {/* Nút bật/tắt Markers (giữ lại nếu cần) */}
          <Button
            onClick={() => setShowMarkers(!showMarkers)}
            size="lg"
            className={`md:rounded-xl rounded-lg md:h-12 h-10 md:px-3 px-2.5 shadow-sm transition-all ${
              showMarkers
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 border-0'
                : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
            }`}
            variant={showMarkers ? "default" : "outline"}
            title="Bật/Tắt Markers"
          >
            <MapPin className="md:w-4 md:h-4 w-3.5 h-3.5 md:mr-2 mr-0" />
            <span className="md:text-xs text-[10px] md:inline hidden">Markers</span>
          </Button>
        </div>

        {/* Locate Me Button */}
        <Button
          onClick={handleLocateMe}
          size="lg"
          className="md:rounded-2xl rounded-xl md:w-14 md:h-14 w-12 h-12 shadow-xl bg-white/95 backdrop-blur-xl text-blue-600 hover:bg-blue-50 border border-blue-200/50"
          variant="outline"
          title="Định vị tôi"
        >
          <Navigation className="md:w-5 md:h-5 w-4 h-4" />
        </Button>

        {/* Add Report Button */}
        <Button
          onClick={() => {
            if (!user && onShowLoginPrompt) {
              onShowLoginPrompt();
            } else {
              if (!selectedLocation) {
                //  toast.info("Vui lòng chọn một vị trí trên bản đồ trước khi báo cáo.");
                 return;
              }
              onReportClick();
            }
          }}
          size="lg"
          className="md:rounded-2xl rounded-xl md:w-14 md:h-14 w-12 h-12 shadow-xl bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 border-0 shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all hover:scale-105"
          title="Tạo báo cáo mới tại vị trí đã chọn"
          // disabled={!selectedLocation && user} // Disable nếu đã login mà chưa chọn vị trí
        >
          <Plus className="md:w-6 md:h-6 w-5 h-5 text-white" />
        </Button>
      </div>

      {/* Location Info Panel */}
      {showLocationInfo && selectedLocation && (
        <LocationInfo
          location={selectedLocation}
          reports={reports.filter( // Lọc chính xác hơn cho LocationInfo
            r => r.lat === selectedLocation.lat && r.lng === selectedLocation.lng
          )}
          selectedReport={selectedReport} // Truyền selectedReport nếu có
          onClose={() => {
            setShowLocationInfo(false);
            setSelectedReport(null);
            onLocationSelect(null); // Bỏ chọn vị trí khi đóng panel
          }}
          onReportUpdate={loadReports} // Cho phép LocationInfo trigger reload
          onShowLoginPrompt={!user ? onShowLoginPrompt : undefined}
        />
      )}

      {/* Enhanced Legend */}
       <div className={`absolute top-4 right-4 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-lg shadow-gray-900/5 z-20 border border-gray-200/60 md:w-64 w-auto max-w-[calc(100vw-3rem)] overflow-hidden transition-all duration-300 ${isLegendExpanded ? 'h-auto' : 'md:h-auto h-[58px]'}`}>
         {/* Subtle gradient overlay */}
         <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 via-transparent to-teal-50/20 pointer-events-none"></div>

         <div className="relative md:p-4 p-2">
           {/* Header */}
           <button
             onClick={() => setIsLegendExpanded(!isLegendExpanded)}
             className="flex items-center justify-between w-full md:mb-3.5 mb-0 md:pb-3 md:border-b border-gray-200/60 p-1 md:p-0 rounded-lg md:rounded-none hover:bg-gray-50/80 md:hover:bg-transparent transition-colors md:cursor-default cursor-pointer"
           >
             <div className="flex items-center gap-2">
                <div className="w-9 h-9 md:w-9 md:h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/25 shrink-0">
                  <Filter className="w-4 h-4 text-white" />
                </div>
               <div className="text-left">
                 <h3 className="text-gray-900 text-sm md:text-sm tracking-tight mb-0 md:mb-0.5">Chỉ số AQI</h3>
                 <p className="text-xs md:text-xs text-gray-500 hidden md:block">Chất lượng không khí</p>
                 <p className="text-[10px] text-gray-500 md:hidden">Chất lượng KK</p>
               </div>
             </div>
              <div className={`transition-transform duration-200 md:hidden ${isLegendExpanded ? 'rotate-180' : ''}`}>
                 <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                 </svg>
               </div>
           </button>

            {/* Legend Items (Conditional rendering based on expanded state) */}
           <div className={`space-y-1.5 transition-all duration-300 overflow-hidden ${isLegendExpanded ? 'mt-2.5 max-h-96 opacity-100' : 'max-h-0 opacity-0 md:max-h-96 md:opacity-100 md:mt-0'}`}>
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