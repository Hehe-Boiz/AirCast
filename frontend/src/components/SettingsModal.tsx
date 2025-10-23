import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { User, Camera, Mail, UserCircle, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import type { User as UserType } from '../App';
import { usersService } from '../services';

type SettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  onSave: (updatedUser: Partial<UserType>) => void;
};

export function SettingsModal({ isOpen, onClose, user, onSave }: SettingsModalProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [avatar, setAvatar] = useState(user.avatar);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const avatarUrl = await usersService.uploadAvatar(file);
      setAvatar(avatarUrl);
      onSave({ avatar: avatarUrl });
      
      toast.success('🎉 Cập nhật avatar thành công!');
    } catch (error: any) {
      toast.error('Không thể tải ảnh lên', {
        description: error.message || 'Vui lòng thử lại sau',
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên');
      return;
    }

    if (!email.trim()) {
      toast.error('Vui lòng nhập email');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Email không hợp lệ');
      return;
    }

    // Check if password fields are being used
    const isChangingPassword = currentPassword || newPassword || confirmPassword;

    setIsSaving(true);

    try {
      // Update profile (name, email)
      const updatedUser = await usersService.updateProfile({
        name: name.trim(),
        email: email.trim(),
      });

      // Change password if provided
      if (isChangingPassword) {
        // Password validation
        if (!currentPassword) {
          toast.error('Vui lòng nhập mật khẩu hiện tại');
          setIsSaving(false);
          return;
        }
        if (newPassword !== confirmPassword) {
          toast.error('Mật khẩu mới không khớp');
          setIsSaving(false);
          return;
        }
        if (newPassword.length < 8) {
          toast.error('Mật khẩu mới phải có ít nhất 8 ký tự');
          setIsSaving(false);
          return;
        }

        await usersService.changePassword({
          old_password: currentPassword,
          new_password: newPassword,
          new_password_confirm: confirmPassword,
        });

        toast.success('✅ Đổi mật khẩu thành công!');
      }

      onSave(updatedUser);
      
      toast.success('🎉 Cập nhật thông tin thành công!', {
        description: 'Thông tin của bạn đã được lưu.',
      });

      // Reset password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      onClose();
    } catch (error: any) {
      toast.error('Không thể cập nhật thông tin', {
        description: error.message || 'Vui lòng thử lại sau',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    // Reset to original values
    setName(user.name);
    setEmail(user.email);
    setAvatar(user.avatar);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="md:max-w-2xl max-w-[95vw] md:max-h-[90vh] max-h-[95vh] overflow-y-auto md:p-6 p-4">
        <DialogHeader>
          <DialogTitle className="flex items-center md:gap-3 gap-2 md:text-2xl text-lg">
            <div className="md:p-3 p-2 bg-linear-to-br from-emerald-400 to-teal-500 rounded-xl">
              <UserCircle className="md:w-6 md:h-6 w-5 h-5 text-white" />
            </div>
            Chỉnh sửa thông tin cá nhân
          </DialogTitle>
          <DialogDescription className="md:text-sm text-xs">
            Cập nhật thông tin tài khoản và mật khẩu của bạn
          </DialogDescription>
        </DialogHeader>

        <div className="md:space-y-6 space-y-4 md:mt-6 mt-4">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center md:gap-4 gap-3 md:p-6 p-4 bg-linear-to-br from-gray-50 to-white rounded-2xl border border-gray-200">
            <div className="relative group">
              <Avatar className="md:w-24 md:h-24 w-20 h-20 border-4 border-emerald-200 shadow-lg">
                {avatar && <AvatarImage src={avatar} alt={name} />}
                <AvatarFallback className="bg-linear-to-br from-emerald-500 to-teal-600 text-white md:text-3xl text-2xl">
                  {name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                disabled={isUploadingAvatar}
              />
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 md:p-2.5 p-2 bg-linear-to-br from-emerald-400 to-teal-500 rounded-full border-4 border-white shadow-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploadingAvatar ? (
                  <div className="md:w-4 md:h-4 w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="md:w-4 md:h-4 w-3.5 h-3.5 text-white" />
                )}
              </label>
            </div>
            <div className="text-center">
              <p className="text-gray-500 md:text-sm text-xs">
                {isUploadingAvatar ? 'Đang tải lên...' : 'Nhấp vào ảnh để thay đổi'}
              </p>
              <p className="text-gray-400 md:text-xs text-[10px] md:mt-1 mt-0.5">PNG, JPG tối đa 5MB</p>
            </div>
          </div>

          {/* Personal Info */}
          <div className="md:space-y-4 space-y-3">
            <h3 className="md:text-lg text-base flex items-center md:gap-2 gap-1.5 text-gray-900">
              <User className="md:w-5 md:h-5 w-4 h-4 text-emerald-600" />
              Thông tin cá nhân
            </h3>
            
            <div className="grid md:grid-cols-2 grid-cols-1 md:gap-4 gap-3">
              <div className="space-y-2">
                <Label htmlFor="name" className="md:text-sm text-xs">Họ và tên</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập họ và tên"
                  className="md:h-11 h-9 md:text-base text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="md:text-sm text-xs">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 md:w-4 md:h-4 w-3.5 h-3.5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="md:h-11 h-9 md:pl-10 pl-9 md:text-base text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Password Section */}
          <div className="md:space-y-4 space-y-3 md:pt-4 pt-3 border-t border-gray-200">
            <div>
              <h3 className="md:text-lg text-base flex items-center md:gap-2 gap-1.5 text-gray-900">
                <svg className="md:w-5 md:h-5 w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Thay đổi mật khẩu
              </h3>
              <p className="md:text-sm text-xs text-gray-500 md:mt-1 mt-0.5">
                Để trống nếu không muốn thay đổi mật khẩu
              </p>
            </div>

            <div className="md:space-y-4 space-y-3">
              <div className="space-y-2">
                <Label htmlFor="current-password" className="md:text-sm text-xs">Mật khẩu hiện tại</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="md:h-11 h-9 md:text-base text-sm"
                />
              </div>

              <div className="grid md:grid-cols-2 grid-cols-1 md:gap-4 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="md:text-sm text-xs">Mật khẩu mới</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="md:h-11 h-9 md:text-base text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="md:text-sm text-xs">Xác nhận mật khẩu mới</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="md:h-11 h-9 md:text-base text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex md:gap-3 gap-2 md:pt-4 pt-3 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 md:h-11 h-9 md:text-base text-sm"
              disabled={isSaving}
            >
              <X className="md:w-4 md:h-4 w-3.5 h-3.5 md:mr-2 mr-1.5" />
              Hủy
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 md:h-11 h-9 bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 md:text-base text-sm"
              disabled={isSaving}
            >
              <Save className="md:w-4 md:h-4 w-3.5 h-3.5 md:mr-2 mr-1.5" />
              {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
