import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LoginScreen } from './components/LoginScreen';
import { RegisterScreen } from './components/RegisterScreen';
import { AuthBackground } from './components/AuthBackground';
import { MapView } from './components/MapView';
import { ReportModal } from './components/ReportModal';
import { Sidebar } from './components/Sidebar';
import { Toaster } from './components/ui/sonner';
import { authService } from './services';

export type User = {
  id: string;
  name: string;
  email: string;
  reputation: number;
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

  const handleLogin = async (email: string, password: string) => {
    const loggedInUser = authService.getCurrentUser();
    if (loggedInUser) {
      setUser(loggedInUser);
    }
  };

  const handleRegister = async (email: string, password: string) => {
    const registeredUser = authService.getCurrentUser();
    if (registeredUser) {
      setUser(registeredUser);
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

  if (!user) {
    return (
      <div className="min-h-screen w-full relative overflow-hidden">
        {/* Fixed background layer */}
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
      <Sidebar 
        user={user} 
        onLogout={handleLogout}
        onUserUpdate={handleUserUpdate}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      
      <div className="flex-1 relative">
        <MapView 
          key={reportRefreshKey}
          user={user}
          onReportClick={() => setIsReportModalOpen(true)}
          onLocationSelect={setSelectedLocation}
          selectedLocation={selectedLocation}
          isSidebarOpen={isSidebarOpen}
          onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </div>

      <ReportModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        user={user}
        location={selectedLocation}
        onReportCreated={handleReportCreated}
      />

      <Toaster />
    </div>
  );
}