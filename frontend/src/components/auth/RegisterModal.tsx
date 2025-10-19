import React, { useState } from 'react';
import { authService } from '../../services/authService';
import type { RegisterRequest } from '../../services/authService';
import styles from './AuthModal.module.css';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState<RegisterRequest>({ username: '', email: '', password: '', fullName: '', birthday: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await authService.register(formData);
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles['modal-overlay']} onClick={onClose}>
      <div className={styles['modal-content']} onClick={(e) => e.stopPropagation()}>
        <h2>Đăng ký</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Tên đăng nhập"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="fullName"
            placeholder="Họ và tên"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="date"
            name="birthday"
            placeholder="Ngày sinh"
            value={formData.birthday}
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
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
            <button
              className={styles['google-btn']}
              type="button"
              onClick={() => {
                const clientId = '928507113226-qqrcj7hbtt3maq2r56lrh20lqseg866s.apps.googleusercontent.com';
                const redirectUri = window.location.origin + '/oauth2/redirect';
                const scope = 'openid profile email';
                const state = 'register';
                const oauthUrl =
                  `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}` +
                  `&redirect_uri=${encodeURIComponent(redirectUri)}` +
                  `&scope=${encodeURIComponent(scope)}` +
                  `&state=${state}`;
                window.location.href = oauthUrl;
              }}
            >
              <img src="/icons/google.svg" alt="Google" style={{ width: 22, height: 22 }} />
              Đăng ký với Google
            </button>
        </form>
        <button className={styles['close-btn']} onClick={onClose}>Đóng</button>
      </div>
    </div>
  );
};

export default RegisterModal;