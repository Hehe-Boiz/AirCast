import { useState, useRef, useEffect } from 'react';
import { X, Image as ImageIcon, Volume2, Clock, User, Star, MessageSquare, MapPin, TrendingUp, ThumbsUp, ThumbsDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback } from './ui/avatar';
import type { Report } from '../App';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { reportsService } from '../services';
import { toast } from 'sonner';
import { AIR_LEVEL, NOISE_LEVEL } from '../types/api';

type LocationInfoProps = {
  location: { lat: number; lng: number };
  reports: Report[];
  selectedReport: Report | null;
  onClose: () => void;
  onReportUpdate?: () => void;
  onShowLoginPrompt?: () => void;
};

export function LocationInfo({ location, reports, selectedReport, onClose, onReportUpdate, onShowLoginPrompt }: LocationInfoProps) {
  const [votingReport, setVotingReport] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    const scrollContainer = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLDivElement;
      const scrollTop = target.scrollTop;
      const scrollHeight = target.scrollHeight;
      const clientHeight = target.clientHeight;
      
      setIsScrolled(scrollTop > 10);
      setShowBackToTop(scrollTop > 300);
      setShowScrollIndicator(scrollTop + clientHeight < scrollHeight - 20);
    };

    const scrollContainer = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      
      // Check initially if content is scrollable
      setTimeout(() => {
        const scrollHeight = scrollContainer.scrollHeight;
        const clientHeight = scrollContainer.clientHeight;
        setShowScrollIndicator(scrollHeight > clientHeight);
      }, 100);
      
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [reports]);

  const handleVote = async (reportId: string, voteType: 'up' | 'down') => {
    // Check if user is logged in
    if (onShowLoginPrompt) {
      onShowLoginPrompt();
      return;
    }
    
    setVotingReport(reportId);
    try {
      const result = await reportsService.voteReport(reportId, voteType);
      
      if (voteType === 'up') {
        toast.success('✅ Đã xác nhận báo cáo chính xác', {
          description: 'Cảm ơn bạn đã đóng góp xác minh!',
        });
      } else {
        toast.info('❌ Đã đánh dấu báo cáo không chính xác', {
          description: 'Chúng tôi sẽ xem xét lại báo cáo này.',
        });
      }
      
      // Refresh reports
      if (onReportUpdate) {
        onReportUpdate();
      }
    } catch (error: any) {
      toast.error('Không thể gửi đánh giá', {
        description: error.message || 'Vui lòng thử lại sau',
      });
    } finally {
      setVotingReport(null);
    }
  };
  const getAQILevel = (level?: AIR_LEVEL): { value: number; label: string; color: string; gradient: string } => {
    switch (level) {
      case AIR_LEVEL.GOOD:
        return { value: 30, label: 'Tốt', color: 'bg-green-500', gradient: 'from-green-500 to-emerald-600' };
      case AIR_LEVEL.MODERATE:
        return { value: 75, label: 'Trung bình', color: 'bg-yellow-500', gradient: 'from-yellow-500 to-orange-500' };
      case AIR_LEVEL.UNHEALTHY:
        return { value: 125, label: 'Kém', color: 'bg-orange-500', gradient: 'from-orange-500 to-red-500' };
      case AIR_LEVEL.VERY_UNHEALTHY:
        return { value: 175, label: 'Xấu', color: 'bg-red-500', gradient: 'from-red-500 to-rose-600' };
      case AIR_LEVEL.HAZARDOUS:
        return { value: 225, label: 'Nguy hại', color: 'bg-purple-500', gradient: 'from-purple-500 to-pink-600' };
      default:
        return { value: 50, label: 'Trung bình', color: 'bg-gray-500', gradient: 'from-gray-500 to-gray-600' };
    }
  };

  const getNoiseLevel = (level?: NOISE_LEVEL): { value: number; label: string } => {
    switch (level) {
      case NOISE_LEVEL.QUITE:
        return { value: 40, label: 'Yên tĩnh' };
      case NOISE_LEVEL.MODERATE:
        return { value: 60, label: 'Trung bình' };
      case NOISE_LEVEL.LOUND:
        return { value: 80, label: 'Ồn' };
      case NOISE_LEVEL.VERY_LOUND:
        return { value: 100, label: 'Rất ồn' };
      default:
        return { value: 50, label: 'Trung bình' };
    }
  };

  // Chỉ lấy báo cáo gần nhất (sorted by timestamp, limit 10)
  const recentReports = [...reports]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  const airReports = recentReports.filter(r => r.type === 'air');
  const noiseReports = recentReports.filter(r => r.type === 'noise');

  const avgAQI = airReports.length > 0
    ? Math.round(airReports.reduce((sum, r) => sum + getAQILevel(r.airQuality).value, 0) / airReports.length)
    : null;

  const avgNoise = noiseReports.length > 0
    ? Math.round(noiseReports.reduce((sum, r) => sum + getNoiseLevel(r.noiseLevel).value, 0) / noiseReports.length)
    : null;

  return (
    <div className="absolute top-0 left-0 w-full md:w-[450px] h-full bg-white shadow-2xl z-40 flex flex-col overflow-hidden">
      {/* Header with gradient background */}
      <div className={`bg-linear-to-br from-emerald-500 via-teal-500 to-cyan-500 text-white relative overflow-hidden shrink-0 transition-shadow duration-300 ${
        isScrolled ? 'shadow-lg' : ''
      }`}>
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 md:p-5 p-3">
          {/* Title Row */}
          <div className="flex items-center justify-between md:mb-4 mb-2.5">
            <div className="flex items-center md:gap-2 gap-1.5 flex-1 min-w-0">
              <MapPin className="md:w-5 md:h-5 w-4 h-4 text-white shrink-0" />
              <h2 className="text-white truncate md:text-base text-sm">Thông tin khu vực</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20 md:rounded-xl rounded-lg shrink-0 ml-2 md:h-10 md:w-10 h-8 w-8"
            >
              <X className="md:w-5 md:h-5 w-4 h-4" />
            </Button>
          </div>

          {/* Location coordinates */}
          <p className="md:text-sm text-xs text-white/90 md:mb-4 mb-2.5">
            📍 {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:gap-3 gap-2">
            {avgAQI !== null && (
              <div className="bg-white/20 backdrop-blur-md md:rounded-xl rounded-lg md:p-3 p-2 border border-white/30">
                <div className="md:text-xs text-[10px] text-white/80 mb-0.5">Chất lượng KK</div>
                <div className="md:text-2xl text-xl text-white md:mb-1 mb-0.5">{avgAQI}</div>
                <div className="md:text-xs text-[10px] text-white/80">AQI • {airReports.length} BC</div>
              </div>
            )}
            {avgNoise !== null && (
              <div className="bg-white/20 backdrop-blur-md md:rounded-xl rounded-lg md:p-3 p-2 border border-white/30">
                <div className="md:text-xs text-[10px] text-white/80 mb-0.5">Độ ồn</div>
                <div className="md:text-2xl text-xl text-white md:mb-1 mb-0.5">~{avgNoise}</div>
                <div className="md:text-xs text-[10px] text-white/80">dB • {noiseReports.length} BC</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-hidden" ref={scrollRef}>
        <ScrollArea className="h-full custom-scrollbar">
          <div className="md:p-6 p-4 md:space-y-6 space-y-4">
          {/* Reports List */}
          <div className="md:space-y-4 space-y-3">
            <div className="flex items-center justify-between md:mb-4 mb-3">
              <h3 className="text-gray-900 flex items-center md:gap-2 gap-1.5 md:text-base text-sm">
                <TrendingUp className="md:w-5 md:h-5 w-4 h-4 text-emerald-600" />
                Báo cáo gần đây tại vị trí này
              </h3>
              {recentReports.length > 0 && (
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 md:text-xs text-[10px]">
                  {recentReports.length} báo cáo
                </Badge>
              )}
            </div>
            
            {recentReports.length === 0 ? (
              <Card className="md:p-8 p-5 text-center border-2 border-dashed border-gray-200">
                <div className="md:w-16 md:h-16 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto md:mb-4 mb-3">
                  <MessageSquare className="md:w-8 md:h-8 w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-900 md:mb-2 mb-1.5 md:text-base text-sm">Chưa có báo cáo nào</p>
                <p className="md:text-sm text-xs text-gray-500">Hãy là người đầu tiên báo cáo tại khu vực này!</p>
              </Card>
            ) : (
              <div className="md:space-y-3 space-y-2">
                {recentReports.map((report) => {
                  const isSelected = selectedReport?.id === report.id;
                  const aqiData = report.type === 'air' ? getAQILevel(report.airQuality) : null;
                  
                  return (
                    <Card
                      key={report.id}
                      className={`md:p-4 p-3 transition-all hover:shadow-lg ${
                        isSelected
                          ? 'ring-2 ring-emerald-500 shadow-lg bg-emerald-50/50'
                          : 'hover:border-emerald-200'
                      }`}
                    >
                      {/* User Info */}
                      <div className="flex items-center md:gap-3 gap-2 md:mb-3 mb-2">
                        <Avatar className="md:w-10 md:h-10 w-8 h-8 md:border-2 border border-gray-200">
                          <AvatarFallback className="bg-linear-to-br from-emerald-500 to-teal-600 text-white md:text-base text-xs">
                            {report.userName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center md:gap-2 gap-1.5">
                            <span className="md:text-sm text-xs truncate">{report.userName}</span>
                            {report.userReputation >= 90 && (
                              <Badge variant="secondary" className="md:text-xs text-[10px] bg-yellow-100 text-yellow-700 md:px-2 px-1.5 md:py-0.5 py-0 shrink-0">
                                ⭐ Chuyên gia
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center md:gap-1 gap-0.5 md:text-xs text-[10px] text-gray-500">
                            <Star className="md:w-3 md:h-3 w-2.5 h-2.5 text-yellow-500" fill="currentColor" />
                            <span>{report.userReputation} điểm</span>
                          </div>
                        </div>
                        <div className="md:text-xs text-[10px] text-gray-500 flex items-center md:gap-1 gap-0.5 shrink-0">
                          <Clock className="md:w-3 md:h-3 w-2.5 h-2.5" />
                          {format(report.timestamp, 'HH:mm', { locale: vi })}
                        </div>
                      </div>

                      {/* Report Content */}
                      {report.type === 'air' && report.airQuality && aqiData && (
                        <div className="md:mb-3 mb-2">
                          <div className={`inline-flex items-center md:gap-2 gap-1.5 md:px-3 px-2 md:py-2 py-1.5 md:rounded-lg rounded-md bg-linear-to-r ${aqiData.gradient}`}>
                            <span className="md:text-sm text-xs text-white">🌫️ Không khí: {aqiData.label}</span>
                            <span className="md:text-xs text-[10px] text-white/90">({aqiData.value} AQI)</span>
                          </div>
                        </div>
                      )}

                      {report.type === 'noise' && report.noiseLevel && (
                        <div className="md:mb-3 mb-2">
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700 md:text-xs text-[10px]">
                            <Volume2 className="md:w-3 md:h-3 w-2.5 h-2.5 md:mr-1 mr-0.5" />
                            Tiếng ồn: {getNoiseLevel(report.noiseLevel).label} (~{getNoiseLevel(report.noiseLevel).value} dB)
                          </Badge>
                        </div>
                      )}

                      {report.comment && (
                        <div className="md:mb-3 mb-2 md:p-3 p-2 bg-linear-to-br from-gray-50 to-gray-100 md:rounded-lg rounded-md border border-gray-200">
                          <div className="flex items-start md:gap-2 gap-1.5">
                            <MessageSquare className="md:w-4 md:h-4 w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                            <p className="md:text-sm text-xs text-gray-700 leading-relaxed">{report.comment}</p>
                          </div>
                        </div>
                      )}

                      {report.imageUrl && (
                        <div className="md:mb-3 mb-2 relative group">
                          <img
                            src={report.imageUrl}
                            alt="Báo cáo"
                            className="w-full md:h-48 h-36 object-cover md:rounded-xl rounded-lg border border-gray-200"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors md:rounded-xl rounded-lg"></div>
                        </div>
                      )}

                      {report.audioUrl && (
                        <div className="md:mb-3 mb-2 md:p-3 p-2 bg-linear-to-br from-blue-50 to-cyan-50 md:rounded-lg rounded-md border border-blue-200">
                          <div className="flex items-center md:gap-3 gap-2">
                            <div className="bg-blue-100 md:p-2 p-1.5 md:rounded-lg rounded-md">
                              <Volume2 className="md:w-4 md:h-4 w-3.5 h-3.5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="md:text-sm text-xs text-blue-900 block truncate">File ghi âm</span>
                              <p className="md:text-xs text-[10px] text-blue-600">Nhấn để phát</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Validation Buttons */}
                      <div className="flex items-center justify-between md:pt-3 pt-2 border-t border-gray-200">
                        <div className="flex items-center md:gap-4 gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVote(report.id, 'up')}
                            disabled={votingReport === report.id}
                            className={`md:gap-1.5 gap-1 md:h-9 h-7 md:px-3 px-2 ${
                              report.userVote === 'up'
                                ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                                : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            <ThumbsUp className={`md:w-4 md:h-4 w-3 h-3 ${report.userVote === 'up' ? 'fill-current' : ''}`} />
                            <span className="md:text-sm text-xs">{report.upvotes}</span>
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVote(report.id, 'down')}
                            disabled={votingReport === report.id}
                            className={`md:gap-1.5 gap-1 md:h-9 h-7 md:px-3 px-2 ${
                              report.userVote === 'down'
                                ? 'text-red-600 bg-red-50 hover:bg-red-100'
                                : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                            }`}
                          >
                            <ThumbsDown className={`md:w-4 md:h-4 w-3 h-3 ${report.userVote === 'down' ? 'fill-current' : ''}`} />
                            <span className="md:text-sm text-xs">{report.downvotes}</span>
                          </Button>
                        </div>

                        {/* Accuracy indicator */}
                        {(report.upvotes + report.downvotes) > 0 && (
                          <div className="flex items-center md:gap-1.5 gap-1">
                            <div className="md:h-1.5 h-1 md:w-16 w-12 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-linear-to-r from-emerald-500 to-emerald-600 transition-all duration-300"
                                style={{
                                  width: `${(report.upvotes / (report.upvotes + report.downvotes)) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="md:text-xs text-[10px] text-gray-500 shrink-0">
                              {Math.round((report.upvotes / (report.upvotes + report.downvotes)) * 100)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
          </div>
        </ScrollArea>
        
        {/* Scroll Indicator - Bottom */}
        {showScrollIndicator && !showBackToTop && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-white via-white/80 to-transparent pointer-events-none flex items-end justify-center pb-3">
            <div className="animate-bounce">
              <svg
                className="md:w-6 md:h-6 w-5 h-5 text-emerald-500"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
              </svg>
            </div>
          </div>
        )}

        {/* Back to Top Button */}
        {showBackToTop && (
          <div className="absolute md:bottom-6 bottom-4 md:right-6 right-4 z-10">
            <Button
              onClick={scrollToTop}
              size="icon"
              className="md:w-12 md:h-12 w-10 h-10 rounded-full bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
            >
              <ChevronUp className="md:w-5 md:h-5 w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}