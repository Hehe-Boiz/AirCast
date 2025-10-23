import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Button } from './ui/button';
import { LogIn, UserPlus } from 'lucide-react';

type LoginPromptModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  onRegister: () => void;
  action: 'report' | 'vote';
};

export function LoginPromptModal({ isOpen, onClose, onLogin, onRegister, action }: LoginPromptModalProps) {
  const messages = {
    report: {
      title: '🔒 Vui lòng đăng nhập để báo cáo',
      description: 'Bạn cần có tài khoản để tạo báo cáo mới và đóng góp cho cộng đồng. Đăng nhập ngay để bắt đầu!',
    },
    vote: {
      title: '🔒 Vui lòng đăng nhập để đánh giá',
      description: 'Bạn cần có tài khoản để đánh giá độ chính xác của báo cáo. Đăng nhập ngay để tham gia!',
    },
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl flex items-center gap-2">
            {messages[action].title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base pt-2">
            {messages[action].description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto order-3 sm:order-1"
          >
            Để sau
          </Button>
          <Button
            onClick={onRegister}
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 order-2"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Đăng ký
          </Button>
          <Button
            onClick={onLogin}
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 order-1 sm:order-3"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Đăng nhập
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
