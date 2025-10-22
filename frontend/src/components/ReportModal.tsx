import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Upload, Mic, Smile, Frown, AlertTriangle, Skull, Volume2, VolumeX, Send, Camera, Image as ImageIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import type { User, AirQualityLevel, NoiseLevel } from '../App';
import { reportsService } from '../services';
import { OptionButton } from './OptionButton';


type ReportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  location: { lat: number; lng: number } | null;
  onReportCreated?: () => void;
};

export function ReportModal({ isOpen, onClose, user, location, onReportCreated }: ReportModalProps) {
  const [reportType, setReportType] = useState<'air' | 'noise'>('air');
  const [airQuality, setAirQuality] = useState<AirQualityLevel | null>(null);
  const [noiseLevel, setNoiseLevel] = useState<NoiseLevel | null>(null);
  const [comment, setComment] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [audio, setAudio] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (reportType === 'air' && !airQuality) {
      toast.error('Vui lòng chọn mức độ chất lượng không khí');
      return;
    }
    if (reportType === 'noise' && !noiseLevel) {
      toast.error('Vui lòng chọn mức độ tiếng ồn');
      return;
    }
    if (!location) {
      toast.error('Vui lòng chọn vị trí trên bản đồ');
      return;
    }

    setIsSubmitting(true);

    try {
      // Call API service
      const response = await reportsService.createReport({
        type: reportType,
        lat: location.lat,
        lng: location.lng,
        air_quality: airQuality || undefined,
        noise_level: noiseLevel || undefined,
        comment: comment || undefined,
        image: image || undefined,
        audio: audio || undefined,
      });

      toast.success('🎉 Báo cáo đã được gửi thành công!', {
        description: `Cảm ơn bạn đã đóng góp cho cộng đồng. +${response.reputation_gained} điểm uy tín!`,
      });

      // Reset form
      setAirQuality(null);
      setNoiseLevel(null);
      setComment('');
      setImage(null);
      setAudio(null);
      
      // Notify parent to reload reports
      if (onReportCreated) {
        onReportCreated();
      }
      
      onClose();
    } catch (error: any) {
      toast.error('Không thể gửi báo cáo', {
        description: error.message || 'Vui lòng thử lại sau',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      toast.success('✅ Ảnh đã được tải lên');
    }
  };

  const handleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      toast.info('🎤 Đang ghi âm...');
      // Mock recording
      setTimeout(() => {
        setIsRecording(false);
        setAudio(new File([''], 'recording.mp3'));
        toast.success('✅ Ghi âm hoàn tất');
      }, 3000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 gap-0 flex flex-col">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 bg-linear-to-br from-emerald-50 to-teal-50 border-b shrink-0">
          <DialogTitle className="text-2xl text-gray-900">Báo cáo tình trạng môi trường</DialogTitle>
          <DialogDescription className="text-gray-600">
            {location
              ? `📍 Tại vị trí: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
              : 'Chọn vị trí trên bản đồ để báo cáo'}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto p-6 flex-1 custom-scrollbar">
          <Tabs value={reportType} onValueChange={(v : React.ReactNode) => setReportType(v as 'air' | 'noise')}>
            <TabsList className="grid w-full grid-cols-2 h-12 bg-gray-100 p-1">
              <TabsTrigger value="air" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md">
                🌫️ Không khí
              </TabsTrigger>
              <TabsTrigger value="noise" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md">
                🔊 Tiếng ồn
              </TabsTrigger>
            </TabsList>

            <TabsContent value="air" className="space-y-6 mt-6">
              <div className="space-y-4">
                <Label className="text-base">Chất lượng không khí hiện tại</Label>

                <div className="grid grid-cols-2 gap-3">
                    <OptionButton
                      icon={<Smile className="w-8 h-8" />}
                      label="Tốt"
                      description="0-50 AQI"
                      isSelected={airQuality === 'good'}
                      onClick={() => setAirQuality('good')}
                      variant="green"
                    />
                    <OptionButton
                      icon={<Smile className="w-8 h-8" />}
                      label="Trung bình"
                      description="51-100 AQI"
                      isSelected={airQuality === 'moderate'}
                      onClick={() => setAirQuality('moderate')}
                      variant="yellow"
                    />
                    <OptionButton
                      icon={<Frown className="w-8 h-8" />}
                      label="Kém"
                      description="101-150 AQI"
                      isSelected={airQuality === 'unhealthy'}
                      onClick={() => setAirQuality('unhealthy')}
                      variant="orange"
                    />
                    <OptionButton
                      icon={<AlertTriangle className="w-8 h-8" />}
                      label="Xấu"
                      description="151-200 AQI"
                      isSelected={airQuality === 'very_unhealthy'}
                      onClick={() => setAirQuality('very_unhealthy')}
                      variant="red"
                    />
                    <OptionButton
                      icon={<Skull className="w-8 h-8" />}
                      label="Nguy hại"
                      description="200+ AQI"
                      isSelected={airQuality === 'hazardous'}
                      onClick={() => setAirQuality('hazardous')}
                      variant="purple"
                      className="col-span-2"
                    />
                  </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="image-upload" className="text-base">Thêm ảnh minh chứng (tùy chọn)</Label>
                {image ? (
                  <div className="relative bg-linear-to-br from-green-50 to-emerald-50 border-2 border-dashed border-green-300 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-3 rounded-lg">
                        <ImageIcon className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-green-900">{image.name}</p>
                        <p className="text-xs text-green-600">Sẵn sàng để tải lên</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setImage(null)}
                        className="text-green-600 hover:text-green-700 hover:bg-green-100"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-24 border-2 border-dashed border-gray-300 hover:border-green-400 hover:bg-green-50 rounded-xl transition-all"
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Camera className="w-6 h-6 text-gray-400" />
                      <span className="text-sm text-gray-600">Chọn hoặc chụp ảnh</span>
                    </div>
                  </Button>
                )}
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
            </TabsContent>

            <TabsContent value="noise" className="space-y-6 mt-6">
              <div className="space-y-4">
                <Label className="text-base">Mức độ tiếng ồn</Label>
                <div className="grid grid-cols-2 gap-3">
                  
                  <OptionButton
                    icon={<VolumeX className="w-8 h-8" />}
                    label="Yên tĩnh"
                    description="< 40 dB"
                    isSelected={noiseLevel === 'quiet'}
                    onClick={() => setNoiseLevel('quiet')}
                    variant="green"
                  />
                  <OptionButton
                    icon={<Volume2 className="w-8 h-8" />}
                    label="Trung bình"
                    description="40-60 dB"
                    isSelected={noiseLevel === 'moderate'}
                    onClick={() => setNoiseLevel('moderate')}
                    variant="yellow"
                  />
                  <OptionButton
                    icon={<Volume2 className="w-8 h-8" />}
                    label="Ồn"
                    description="60-80 dB"
                    isSelected={noiseLevel === 'loud'}
                    onClick={() => setNoiseLevel('loud')}
                    variant="orange"
                  />
                  <OptionButton
                    icon={<Volume2 className="w-8 h-8" />}
                    label="Rất ồn"
                    description="> 80 dB"
                    isSelected={noiseLevel === 'very_loud'}
                    onClick={() => setNoiseLevel('very_loud')}
                    variant="red"
                  />
                 
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base">Ghi âm mẫu (tùy chọn)</Label>
                {audio ? (
                  <div className="bg-linear-to-br from-blue-50 to-cyan-50 border-2 border-cyan-300 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-cyan-100 p-3 rounded-lg">
                        <Mic className="w-6 h-6 text-cyan-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-cyan-900">Ghi âm hoàn tất</p>
                        <p className="text-xs text-cyan-600">3 giây</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setAudio(null)}
                        className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-100"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant={isRecording ? 'destructive' : 'outline'}
                    className={`w-full h-24 rounded-xl transition-all ${
                      isRecording 
                        ? 'bg-linear-to-br from-red-500 to-red-600 animate-pulse' 
                        : 'border-2 border-dashed hover:border-cyan-400 hover:bg-cyan-50'
                    }`}
                    onClick={handleRecording}
                    disabled={isRecording}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Mic className={`w-6 h-6 ${isRecording ? 'text-white' : 'text-gray-400'}`} />
                      <span className={`text-sm ${isRecording ? 'text-white' : 'text-gray-600'}`}>
                        {isRecording ? 'Đang ghi âm...' : 'Nhấn để bắt đầu ghi âm'}
                      </span>
                    </div>
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="noise-image-upload" className="text-base">Chụp nguyên nhân gây ồn (tùy chọn)</Label>
                {image ? (
                  <div className="relative bg-linear-to-br from-orange-50 to-red-50 border-2 border-dashed border-orange-300 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-100 p-3 rounded-lg">
                        <ImageIcon className="w-6 h-6 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-orange-900">{image.name}</p>
                        <p className="text-xs text-orange-600">Sẵn sàng để tải lên</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setImage(null)}
                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-100"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-24 border-2 border-dashed border-gray-300 hover:border-orange-400 hover:bg-orange-50 rounded-xl transition-all"
                    onClick={() => document.getElementById('noise-image-upload')?.click()}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Camera className="w-6 h-6 text-gray-400" />
                      <span className="text-sm text-gray-600">Chụp nguồn gây ồn</span>
                    </div>
                  </Button>
                )}
                <input
                  id="noise-image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-3 mt-6">
            <Label htmlFor="comment" className="text-base">Nhận xét chi tiết (tùy chọn)</Label>
            <Textarea
              id="comment"
              placeholder="Mô tả chi tiết về tình trạng môi trường, nguyên nhân gây ô nhiễm/tiếng ồn..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none rounded-xl bg-gray-50 border-gray-200 focus:bg-white"
            />
            <p className="text-xs text-gray-500">💡 Thông tin chi tiết giúp cộng đồng hiểu rõ hơn về tình hình</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t bg-gray-50 shrink-0">
          <Button variant="outline" onClick={onClose} className="flex-1 h-12 rounded-xl" disabled={isSubmitting}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} className="flex-1 h-12 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-lg shadow-emerald-500/30" disabled={isSubmitting}>
            <Send className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Đang gửi...' : 'Gửi báo cáo'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}