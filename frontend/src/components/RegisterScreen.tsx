import { useState } from 'react';
import { motion } from 'motion/react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Leaf, Wind, Volume2, Sparkles, TrendingUp, Users, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { authService } from '../services';
import { toast } from 'sonner';

type RegisterScreenProps = {
  onRegister: (email: string, password: string) => void;
  onBackToLogin: () => void;
  onContinueAsGuest?: () => void;
};

export function RegisterScreen({ onRegister, onBackToLogin, onContinueAsGuest }: RegisterScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (password !== confirmPassword) {
      toast.error('Mật khẩu không khớp', {
        description: 'Vui lòng kiểm tra lại mật khẩu xác nhận',
      });
      return;
    }

    if (password.length < 6) {
      toast.error('Mật khẩu quá ngắn', {
        description: 'Mật khẩu phải có ít nhất 6 ký tự',
      });
      return;
    }

    if (name.trim().length < 2) {
      toast.error('Tên không hợp lệ', {
        description: 'Tên phải có ít nhất 2 ký tự',
      });
      return;
    }

    setIsLoading(true);

    try {
      await authService.register(name, email, password, confirmPassword);
      toast.success('Đăng ký thành công! 🎉', {
        description: 'Chào mừng bạn đến với cộng đồng!',
      });
      onRegister(email, password);
    } catch (error: any) {
      toast.error('Đăng ký thất bại', {
        description: error.message || 'Vui lòng thử lại sau',
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
            <span className="inline-block bg-linear-to-r from-white via-emerald-50 to-white bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(255,255,255,0.5)]">
              Tham Gia
            </span>
            <br />
            <span className="inline-block bg-linear-to-r from-white via-cyan-50 to-white bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(255,255,255,0.5)]">
              Cộng Đồng Ngay
            </span>
          </h1>
          
          <p className="text-xl text-white drop-shadow-lg mb-8">
            Trở thành một phần của cộng đồng giám sát môi trường. 
            Mỗi đóng góp của bạn đều có giá trị trong việc xây dựng thành phố xanh.
          </p>

          {/* Benefits */}
          <div className="space-y-4 mt-8">
            <div className="flex items-start gap-3 bg-white/15 backdrop-blur-lg rounded-xl p-4 border border-white/30">
              <CheckCircle2 className="w-6 h-6 text-white shrink-0 mt-0.5" />
              <div>
                <div className="text-white mb-1">Đóng góp cho cộng đồng</div>
                <div className="text-sm text-white/80">Báo cáo chất lượng không khí và độ ồn ngay tại khu vực của bạn</div>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white/15 backdrop-blur-lg rounded-xl p-4 border border-white/30">
              <CheckCircle2 className="w-6 h-6 text-white shrink-0 mt-0.5" />
              <div>
                <div className="text-white mb-1">Xây dựng uy tín</div>
                <div className="text-sm text-white/80">Tăng điểm uy tín khi báo cáo chính xác được cộng đồng xác nhận</div>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white/15 backdrop-blur-lg rounded-xl p-4 border border-white/30">
              <CheckCircle2 className="w-6 h-6 text-white shrink-0 mt-0.5" />
              <div>
                <div className="text-white mb-1">Xem dữ liệu trực quan</div>
                <div className="text-sm text-white/80">Truy cập heatmap và thông tin chi tiết về môi trường xung quanh</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right side - Register form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
        <Card className="p-8 md:p-10 shadow-2xl border-0 bg-white/95 backdrop-blur-xl">
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToLogin}
              className="mb-4 text-gray-600 hover:text-gray-900 -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại đăng nhập
            </Button>
          </div>

          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="bg-linear-to-br from-emerald-500 to-emerald-600 p-4 rounded-2xl shadow-lg transform hover:scale-110 transition-transform">
                <Leaf className="w-7 h-7 text-white" />
              </div>
              <div className="bg-linear-to-br from-teal-500 to-teal-600 p-4 rounded-2xl shadow-lg transform hover:scale-110 transition-transform" style={{ animationDelay: '0.1s' }}>
                <Wind className="w-7 h-7 text-white" />
              </div>
              <div className="bg-linear-to-br from-cyan-500 to-cyan-600 p-4 rounded-2xl shadow-lg transform hover:scale-110 transition-transform" style={{ animationDelay: '0.2s' }}>
                <Volume2 className="w-7 h-7 text-white" />
              </div>
            </div>
            <h2 className="mb-3 text-gray-900">Tạo tài khoản mới</h2>
            <p className="text-gray-600">Tham gia cộng đồng giám sát môi trường</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700">Tên của bạn</Label>
              <Input
                id="name"
                type="text"
                placeholder="Nguyễn Văn A"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
              />
            </div>

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
                minLength={6}
                className="h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">Tối thiểu 6 ký tự</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700">Xác nhận mật khẩu</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all" 
              disabled={isLoading}
            >
              <span className="text-white">{isLoading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}</span>
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

            <p className="text-center text-sm text-gray-500 pt-4">
              Bằng cách đăng ký, bạn đồng ý với <span className="text-emerald-600 hover:underline cursor-pointer">Điều khoản sử dụng</span> và <span className="text-emerald-600 hover:underline cursor-pointer">Chính sách bảo mật</span>
            </p>
          </form>
        </Card>
        </motion.div>
      </div>
  );
}
