import { showToast } from '../utils/toast';
import { config } from '../config/api';

const API_BASE = config.apiUrl;

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  roles: string[];
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  birthday: string;
}

export interface ForgotPasswordRequest {
  usernameOrEmail: string;
}

export interface ResetPasswordRequest {
  usernameOrEmail: string;
  resetCode: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileResponse {
  id: number;
  fullName: string;
  username: string;
  email: string;
  avatar?: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  birthDay?: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  birthDay?: string; // ISO date
  email?: string;
  avatar?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangeEmailRequest {
  newEmail: string;
  password: string;
}

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse | null> => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          showToast.success('Đăng nhập thành công!');
          localStorage.setItem('token', result.data.accessToken);
          return result.data;
        } else {
          showToast.error(result.message || 'Đăng nhập thất bại');
          return null;
        }
      } else {
        const error = await response.json();
        showToast.error(error.message || 'Đăng nhập thất bại');
        return null;
      }
    } catch (error) {
      showToast.error('Lỗi mạng');
      return null;
    }
  },

  register: async (data: RegisterRequest): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE}/account/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          showToast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác thực.');
          return result;
        } else {
          showToast.error(result.message || 'Đăng ký thất bại');
          return null;
        }
      } else {
        const error = await response.json();
        showToast.error(error.message || 'Đăng ký thất bại');
        return null;
      }
    } catch (error) {
      showToast.error('Lỗi mạng');
      return null;
    }
  },

  getProfile: async (): Promise<ProfileResponse | null> => {
    const token = localStorage.getItem('token');
    if (!token) {
      showToast.error('Không tìm thấy token đăng nhập');
      return null;
    }
    try {
      const response = await fetch(`${API_BASE}/account/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          return result.data;
        } else {
          showToast.error(result.message || 'Lấy thông tin người dùng thất bại');
          return null;
        }
      } else {
        showToast.error('Lấy thông tin người dùng thất bại');
        return null;
      }
    } catch (error) {
      showToast.error('Lỗi mạng');
      return null;
    }
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          showToast.success('Mã xác nhận đã được gửi đến email của bạn.');
          return result;
        } else {
          showToast.error(result.message || 'Gửi mã thất bại');
          return null;
        }
      } else {
        const error = await response.json();
        showToast.error(error.message || 'Gửi mã thất bại');
        return null;
      }
    } catch (error) {
      showToast.error('Lỗi mạng');
      return null;
    }
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          showToast.success('Mật khẩu đã được đặt lại thành công!');
          return result;
        } else {
          showToast.error(result.message || 'Đặt lại mật khẩu thất bại');
          return null;
        }
      } else {
        const error = await response.json();
        showToast.error(error.message || 'Đặt lại mật khẩu thất bại');
        return null;
      }
    } catch (error) {
      showToast.error('Lỗi mạng');
      return null;
    }
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<ProfileResponse | null> => {
    const token = localStorage.getItem('token');
    if (!token) { showToast.error('Không tìm thấy token'); return null; }
    try {
      const response = await fetch(`${API_BASE}/account/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        showToast.success('Cập nhật thông tin thành công');
        return result.data;
      }
      showToast.error(result.message || 'Cập nhật thất bại');
      return null;
    } catch (err) {
      showToast.error('Lỗi mạng');
      return null;
    }
  },

  changePassword: async (data: ChangePasswordRequest): Promise<boolean> => {
    const token = localStorage.getItem('token');
    if (!token) { showToast.error('Không tìm thấy token'); return false; }
    try {
      const response = await fetch(`${API_BASE}/account/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        showToast.success('Mật khẩu đã được thay đổi');
        return true;
      }
      showToast.error(result.message || 'Thay đổi mật khẩu thất bại');
      return false;
    } catch (err) {
      showToast.error('Lỗi mạng');
      return false;
    }
  },

  changeEmail: async (data: ChangeEmailRequest): Promise<boolean> => {
    const token = localStorage.getItem('token');
    if (!token) { showToast.error('Không tìm thấy token'); return false; }
    try {
      const response = await fetch(`${API_BASE}/account/change-email`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        showToast.success('Yêu cầu đổi email gửi thành công. Vui lòng xác thực email mới.');
        return true;
      }
      showToast.error(result.message || 'Đổi email thất bại');
      return false;
    } catch (err) {
      showToast.error('Lỗi mạng');
      return false;
    }
  },

  uploadAvatar: async (file: File): Promise<string | null> => {
    const token = localStorage.getItem('token');
    if (!token) { showToast.error('Không tìm thấy token'); return null; }
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const response = await fetch(`${API_BASE}/account/upload-avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: fd,
      });
      const result = await response.json();
      if (response.ok && result.success) {
        showToast.success('Avatar đã được cập nhật');
        return result.data || result.message || null;
      }
      showToast.error(result.message || 'Upload avatar thất bại');
      return null;
    } catch (err) {
      showToast.error('Lỗi mạng');
      return null;
    }
  },
};