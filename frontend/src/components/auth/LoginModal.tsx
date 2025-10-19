import React, { useState } from 'react';
import { authService } from '../../services/authService';
import type { LoginRequest } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';
import styles from './AuthModal.module.css';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onForgotPassword: () => void;
  onOpenRegister?: () => void; // optional prop to open register modal
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onForgotPassword, onOpenRegister }) => {
  const [formData, setFormData] = useState<LoginRequest>({ usernameOrEmail: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await authService.login(formData);
    setLoading(false);
    if (result) {
      // Get profile after login
      const profile = await authService.getProfile();
      if (profile) {
        login({
          id: profile.id,
          username: profile.username,
          email: profile.email,
          fullName: profile.fullName,
          avatar: profile.avatar || '/uploads/avatar/default-avatar.jpg',
          roles: [`ROLE_${profile.role}`],
        });
      } else {
        // Fallback if profile fails
        login({
          id: result.id,
          username: result.username,
          email: result.email,
          fullName: '',
          avatar: '/uploads/avatar/default-avatar.jpg',
          roles: result.roles ? result.roles.map((r: string) => `ROLE_${r}`) : [],
        });
      }
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles['modal-overlay']} onClick={onClose}>
      <div className={styles['modal-content']} onClick={(e) => e.stopPropagation()}>
        <h2>Đăng nhập</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="usernameOrEmail"
            placeholder="Tên đăng nhập hoặc email"
            value={formData.usernameOrEmail}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Mật khẩu"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
          <div className={styles['link-row']}>
            <button type="button" className={styles['forgot-btn']} onClick={onForgotPassword}>
              Quên mật khẩu?
            </button>
            <button type="button" className={styles['register-link']} onClick={() => { onClose(); onOpenRegister && onOpenRegister(); }}>
              Đăng ký
            </button>
          </div>
        </form>
          <button
            className={styles['google-btn']}
            type="button"
            onClick={() => {
              const clientId = '928507113226-qqrcj7hbtt3maq2r56lrh20lqseg866s.apps.googleusercontent.com';
              const redirectUri = window.location.origin + '/oauth2/redirect';
              const scope = 'openid profile email';
              const state = 'login';
              const oauthUrl =
                `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}` +
                `&redirect_uri=${encodeURIComponent(redirectUri)}` +
                `&scope=${encodeURIComponent(scope)}` +
                `&state=${state}`;
              window.location.href = oauthUrl;
            }}
          >
            <img src="/icons/google.svg" alt="Google" style={{ width: 22, height: 22 }} />
            Đăng nhập với Google
          </button>
        <button className={styles['close-btn']} onClick={onClose}>Đóng</button>
      </div>
    </div>
  );
};

export default LoginModal;