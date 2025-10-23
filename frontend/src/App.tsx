import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LoginScreen } from './components/LoginScreen';
import { RegisterScreen } from './components/RegisterScreen';
import { AuthBackground } from './components/AuthBackground';
import { MapView } from './components/MapView';
import { ReportModal } from './components/ReportModal';
import { Sidebar } from './components/Sidebar';
import { LoginPromptModal } from './components/LoginPromptModal';
import { Toaster } from './components/ui/sonner';
import { authService } from './services';

export type User = {
  id: string;
  name: string;
  email: string;
  reputation: number;
  avatar?: string; // URL to avatar image
};

export type AirQualityLevel = 'good' | 'moderate' | 'unhealthy' | 'very_unhealthy' | 'hazardous';
export type NoiseLevel = 'quiet' | 'moderate' | 'loud' | 'very_loud';

export type Report = {
  id: string;
  userId: string;
  userName: string;
  userReputation: number;
  lat: number;
  lng: number;
  type: 'air' | 'noise';
  airQuality?: AirQualityLevel;
  noiseLevel?: NoiseLevel;
  comment?: string;
  imageUrl?: string;
  audioUrl?: string;
  timestamp: Date;
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down' | null;
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [reportRefreshKey, setReportRefreshKey] = useState(0);
  const [authScreen, setAuthScreen] = useState<'login' | 'register'>('login');
  const [showAuthScreen, setShowAuthScreen] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginPromptAction, setLoginPromptAction] = useState<'report' | 'vote'>('report');

  useEffect(() => {
    // Kiểm tra xem có thông tin user trong localStorage không
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      // Nếu có, cập nhật lại state của user
      setUser(currentUser);
      // Không cần hiển thị màn hình đăng nhập/đăng ký nữa
      setShowAuthScreen(false);
    } else {
      // Nếu không có, hiển thị màn hình đăng nhập (trừ khi họ đã chọn tiếp tục là khách)
      // Kiểm tra thêm điều kiện nếu bạn có logic "continue as guest" phức tạp hơn
      setShowAuthScreen(true);
    }
  }, []);

  const handleLogin = async (email: string, password: string) => {
    const loggedInUser = authService.getCurrentUser();
    if (loggedInUser) {
      setUser(loggedInUser);
      setShowAuthScreen(false);
    }
  };

  const handleRegister = async (email: string, password: string) => {
    const registeredUser = authService.getCurrentUser();
    if (registeredUser) {
      setUser(registeredUser);
      setShowAuthScreen(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
  };

  const handleUserUpdate = (updatedUser: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updatedUser });
    }
  };

  const handleReportCreated = () => {
    // Trigger refresh reports by incrementing key
    setReportRefreshKey(prev => prev + 1);
  };

  const handleShowLoginPromptModal = (action: 'report' | 'vote' = 'report') => {
    setLoginPromptAction(action);
    setShowLoginPrompt(true);
  };

  const handleGoToLogin = () => {
    setShowLoginPrompt(false);
    setAuthScreen('login');
    setShowAuthScreen(true);
  };

  const handleGoToRegister = () => {
    setShowLoginPrompt(false);
    setAuthScreen('register');
    setShowAuthScreen(true);
  };

  const handleContinueAsGuest = () => {
    setShowAuthScreen(false);
    setUser(null); // Stay as guest
  };

  // Show auth screens when explicitly requested
  if (showAuthScreen) {
    return (
      <div className="min-h-screen w-full relative overflow-hidden">
        {/* Fixed background layer */}
        <Toaster/>
        <AuthBackground />
        
        
        {/* Animated content layer */}
        <div className="relative min-h-screen w-full">
          <AnimatePresence mode="wait" initial={false}>
            {authScreen === 'login' ? (
              <motion.div
                key="login"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ 
                  duration: 0.4,
                  ease: [0.4, 0, 0.2, 1]
                }}
                className="absolute inset-0 overflow-y-auto"
              >
                <div className="min-h-screen w-full flex items-center justify-center p-4 py-8 md:py-4 relative">
                  <LoginScreen 
                    onLogin={handleLogin} 
                    onSwitchToRegister={() => setAuthScreen('register')}
                    onContinueAsGuest={handleContinueAsGuest}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ 
                  duration: 0.4,
                  ease: [0.4, 0, 0.2, 1]
                }}
                className="absolute inset-0 overflow-y-auto"
              >
                <div className="min-h-screen w-full flex items-center justify-center p-4 py-8 md:py-4 relative">
                  <RegisterScreen 
                    onRegister={handleRegister}
                    onBackToLogin={() => setAuthScreen('login')}
                    onContinueAsGuest={handleContinueAsGuest}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-50 flex">
      {/* Sidebar - Only show when logged in */}
      {user && (
        <Sidebar 
          user={user} 
          onLogout={handleLogout}
          onUserUpdate={handleUserUpdate}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      )}
      
      <div className="flex-1 relative">
        <MapView 
          key={reportRefreshKey}
          user={user}
          onReportClick={() => setIsReportModalOpen(true)}
          onLocationSelect={setSelectedLocation}
          selectedLocation={selectedLocation}
          isSidebarOpen={isSidebarOpen}
          onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onShowLoginPrompt={() => handleShowLoginPromptModal('report')}
        />
      </div>

      {/* Report Modal - Only accessible when logged in */}
      {user && (
        <ReportModal 
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          user={user}
          location={selectedLocation}
          onReportCreated={handleReportCreated}
        />
      )}

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        onLogin={handleGoToLogin}
        onRegister={handleGoToRegister}
        action={loginPromptAction}
      />

      <Toaster />
    </div>
  );
}