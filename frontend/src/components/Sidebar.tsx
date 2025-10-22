import { useState } from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { LogOut, Star, Menu, X, TrendingUp, Award, History, Trophy, Target, Flame, Zap, Settings } from 'lucide-react';
import { Progress } from './ui/progress';
import { SettingsModal } from './SettingsModal';
import type { User } from '../App';
import { StatCard } from './StatCard';


type SidebarProps = {
  user: User;
  onLogout: () => void;
  onUserUpdate: (updatedUser: Partial<User>) => void;
  isOpen: boolean;
  onToggle: () => void;
};

export function Sidebar({ user, onLogout, onUserUpdate, isOpen, onToggle }: SidebarProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        onSave={onUserUpdate}
      />

      {/* Sidebar - Responsive Width */}
      <div
        className={`fixed md:relative top-0 left-0 h-full md:w-96 w-80 bg-linear-to-br from-gray-50 to-white border-r border-gray-200 shadow-2xl z-40 transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Close Button - Mobile Only (Top Right when open) */}
        {isOpen && (
          <Button
            onClick={onToggle}
            size="icon"
            className="absolute top-4 right-4 z-50 md:hidden bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 shadow-lg rounded-xl w-10 h-10 border border-white/30"
            variant="ghost"
          >
            <X className="w-5 h-5" />
          </Button>
        )}

        {/* User Profile - Responsive */}
        <div className="md:p-6 p-4 bg-linear-to-br from-emerald-500 via-teal-500 to-cyan-500 text-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 md:w-32 md:h-32 w-24 h-24 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 md:w-24 md:h-24 w-16 h-16 bg-white/5 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center md:gap-4 gap-3 md:mb-6 mb-4">
              <div className="relative">
                <Avatar className="md:w-20 md:h-20 w-14 h-14 md:border-4 border-3 border-white/30 shadow-xl">
                  <AvatarFallback className="bg-linear-to-br from-emerald-600 to-teal-700 text-white md:text-2xl text-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full md:p-1.5 p-1 md:border-2 border border-white shadow-md">
                  <Star className="md:w-3 md:h-3 w-2.5 h-2.5 text-yellow-800" fill="currentColor" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-white md:mb-1 mb-0.5 md:text-base text-sm">{user.name}</h3>
                <p className="md:text-sm text-xs text-emerald-100">{user.email}</p>
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur-md md:rounded-2xl rounded-xl md:p-4 p-3 border border-white/30">
              <div className="flex items-center justify-between md:mb-3 mb-2">
                <div className="flex items-center md:gap-2 gap-1.5">
                  <Trophy className="md:w-5 md:h-5 w-4 h-4 text-yellow-300" />
                  <span className="text-white md:text-base text-sm">Điểm uy tín</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="md:text-2xl text-xl text-white">{user.reputation}</span>
                  <span className="text-emerald-100 md:text-base text-sm">/100</span>
                </div>
              </div>
              <Progress value={user.reputation} className="h-2 bg-white/20" />
              <p className="md:text-xs text-[10px] text-emerald-100 md:mt-2 mt-1.5">
                🔥 Còn {100 - user.reputation} điểm để đạt cấp Chuyên gia
              </p>
            </div>
          </div>
        </div>

        {/* Stats - Responsive */}
        <div className="md:p-6 p-4 md:space-y-6 space-y-4 flex-1 overflow-y-auto">
          <div>
            <h3 className="md:mb-4 mb-3 text-gray-900 flex items-center md:gap-2 gap-1.5 md:text-base text-sm">
              <TrendingUp className="md:w-5 md:h-5 w-4 h-4 text-emerald-600" />
              Thống kê hoạt động
            </h3>
            
            <div className="md:space-y-3 space-y-2">
              <StatCard
                title="Tổng báo cáo"
                value="47 báo cáo"
                subtitle="+3 tuần này"
                icon={<Target className="md:w-6 md:h-6 w-5 h-5 text-white" />}
                variant="cyan"
              />
              <StatCard
                title="Độ chính xác"
                value="94%"
                subtitle="Xuất sắc!"
                icon={<Award className="md:w-6 md:h-6 w-5 h-5 text-white" />}
                variant="emerald"
              />
              <StatCard
                title="Streak hiện tại"
                value="12 ngày"
                subtitle="Tiếp tục phát huy!"
                icon={<Flame className="md:w-6 md:h-6 w-5 h-5 text-white" />}
                variant="orange"
              />
            </div>
          </div>

          <div>
            <h3 className="md:mb-4 mb-3 text-gray-900 flex items-center md:gap-2 gap-1.5 md:text-base text-sm">
              <Zap className="md:w-5 md:h-5 w-4 h-4 text-yellow-600" />
              Thành tích mở khóa
            </h3>
            <div className="grid grid-cols-3 md:gap-3 gap-2">
              {[
                { emoji: '🏆', label: 'Người đi đầu', unlocked: true },
                { emoji: '🎯', label: '50 báo cáo', unlocked: true },
                { emoji: '⭐', label: 'Chính xác', unlocked: true },
                { emoji: '🔥', label: '10 ngày', unlocked: true },
                { emoji: '💎', label: 'Tinh hoa', unlocked: true },
                { emoji: '🌟', label: 'Siêu sao', unlocked: false },
              ].map((achievement, i) => (
                <div
                  key={i}
                  className={`aspect-square md:rounded-2xl rounded-xl flex flex-col items-center justify-center border-2 transition-all hover:scale-105 ${
                    achievement.unlocked 
                      ? 'bg-linear-to-br from-yellow-50 to-orange-50 border-yellow-300 shadow-md cursor-pointer' 
                      : 'bg-gray-100 border-gray-200 opacity-50 grayscale'
                  }`}
                >
                  <span className="md:text-3xl text-2xl md:mb-1 mb-0.5">{achievement.emoji}</span>
                  <span className="md:text-xs text-[10px] text-center text-gray-700 md:px-1 px-0.5">{achievement.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="md:pt-4 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between md:mb-3 mb-2">
              <span className="md:text-sm text-xs text-gray-600">Tiến trình lên cấp</span>
              <span className="md:text-sm text-xs text-emerald-600">Cấp 8</span>
            </div>
            <div className="relative">
              <Progress value={user.reputation} className="md:h-3 h-2.5 bg-gray-200" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="md:text-xs text-[10px] text-white drop-shadow-md">{user.reputation}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between md:mt-2 mt-1.5">
              <span className="md:text-xs text-[10px] text-gray-500">Cấp 7</span>
              <span className="md:text-xs text-[10px] text-gray-500">Cấp 9</span>
            </div>
          </div>
        </div>

        {/* Settings & Logout Buttons - Responsive & Compact */}
        <div className="md:p-6 p-3 border-t border-gray-200 bg-white md:space-y-2.5 space-y-2">
          <Button
            variant="outline"
            className="w-full md:h-9 h-7 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 border-emerald-200 md:rounded-lg rounded-md md:text-sm text-xs"
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings className="md:w-3.5 md:h-3.5 w-3 h-3 md:mr-1.5 mr-1" />
            Cài đặt
          </Button>
          
          <Button
            variant="outline"
            className="w-full md:h-9 h-7 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200 md:rounded-lg rounded-md md:text-sm text-xs"
            onClick={onLogout}
          >
            <LogOut className="md:w-3.5 md:h-3.5 w-3 h-3 md:mr-1.5 mr-1" />
            Đăng xuất
          </Button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden transition-opacity"
          onClick={onToggle}
        />
      )}
    </>
  );
}