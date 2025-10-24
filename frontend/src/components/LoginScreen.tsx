import { useState } from 'react';
import { motion } from 'motion/react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Leaf, Wind, Volume2, Sparkles, TrendingUp, Users } from 'lucide-react';
import { authService } from '../services';
import { toast } from 'sonner';

type LoginScreenProps = {
  onLogin: (email: string, password: string) => void;
  onSwitchToRegister: () => void;
  onContinueAsGuest?: () => void;
};

export function LoginScreen({ onLogin, onSwitchToRegister, onContinueAsGuest }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Call API service instead of mock
      await authService.login(email, password);
      onLogin(email, password);
    } catch (error: any) {
      toast.error('Đăng nhập thất bại', {
        description: error.message || 'Vui lòng kiểm tra email và mật khẩu',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative z-10 w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Hero section */}
        <motion.div 
          className="text-white space-y-6 hidden md:block"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 mb-6 bg-white/20 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/40 shadow-lg"
            animate={{ 
              boxShadow: [
                '0 0 20px rgba(255,255,255,0.3)',
                '0 0 30px rgba(255,255,255,0.5)',
                '0 0 20px rgba(255,255,255,0.3)',
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="w-5 h-5 text-white drop-shadow-lg" />
            <span className="text-white drop-shadow-lg" style={{ fontWeight: 600, letterSpacing: '0.02em' }}>Citizen Science Platform</span>
          </motion.div>
          
          <h1 className="text-white mb-4 drop-shadow-2xl" style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            <span className="inline-block bg-gradient-to-r from-white via-emerald-50 to-white bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(255,255,255,0.5)]">
              Cùng Nhau Tạo Nên
            </span>
            <br />
            <span className="inline-block bg-gradient-to-r from-white via-cyan-50 to-white bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(255,255,255,0.5)]">
              Thành Phố Xanh
            </span>
          </h1>
          
          <p className="text-xl text-white drop-shadow-lg mb-8">
            Giám sát chất lượng không khí và tiếng ồn thông qua sức mạnh cộng đồng. 
            Mỗi báo cáo của bạn giúp cải thiện môi trường sống cho tất cả mọi người.
          </p>

          <div className="grid grid-cols-3 gap-6 mt-12">
            <div className="text-center">
              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 mb-3 border border-white/30 hover:bg-white/30 transition-all shadow-lg">
                <Users className="w-8 h-8 text-white mx-auto mb-2 drop-shadow-lg" />
                <div className="text-white mb-1 drop-shadow-lg">12,547</div>
                <div className="text-sm text-white drop-shadow-lg">Người dùng</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 mb-3 border border-white/30 hover:bg-white/30 transition-all shadow-lg">
                <TrendingUp className="w-8 h-8 text-white mx-auto mb-2 drop-shadow-lg" />
                <div className="text-white mb-1 drop-shadow-lg">47,892</div>
                <div className="text-sm text-white drop-shadow-lg">Báo cáo</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 mb-3 border border-white/30 hover:bg-white/30 transition-all shadow-lg">
                <Sparkles className="w-8 h-8 text-white mx-auto mb-2 drop-shadow-lg" />
                <div className="text-white mb-1 drop-shadow-lg">94%</div>
                <div className="text-sm text-white drop-shadow-lg">Độ chính xác</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right side - Login form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
        <Card className="p-8 md:p-10 shadow-2xl border-0 bg-white/95 backdrop-blur-xl">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 rounded-2xl shadow-lg transform hover:scale-110 transition-transform">
                <Leaf className="w-7 h-7 text-white" />
              </div>
              <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-4 rounded-2xl shadow-lg transform hover:scale-110 transition-transform" style={{ animationDelay: '0.1s' }}>
                <Wind className="w-7 h-7 text-white" />
              </div>
              <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 p-4 rounded-2xl shadow-lg transform hover:scale-110 transition-transform" style={{ animationDelay: '0.2s' }}>
                <Volume2 className="w-7 h-7 text-white" />
              </div>
            </div>
            <h2 className="mb-3 text-gray-900">Chào mừng trở lại</h2>
            <p className="text-gray-600">Đăng nhập để tiếp tục đóng góp cho cộng đồng</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="yourname@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
              />
            </div>

            <Button type="submit" className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all" disabled={isLoading}>
              <span className="text-white">{isLoading ? 'Đang đăng nhập...' : 'Đăng nhập ngay'}</span>
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 text-gray-500 bg-white">Hoặc</span>
              </div>
            </div>

            <Button 
              type="button" 
              variant="outline" 
              onClick={onSwitchToRegister}
              className="w-full h-12 border-gray-300 hover:bg-gray-50"
            >
              Tạo tài khoản mới
            </Button>

            {onContinueAsGuest && (
              <Button 
                type="button" 
                variant="ghost" 
                onClick={onContinueAsGuest}
                className="w-full h-12 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                Tiếp tục với tư cách khách
              </Button>
            )}
          </form>
        </Card>
        </motion.div>
      </div>
  );
}