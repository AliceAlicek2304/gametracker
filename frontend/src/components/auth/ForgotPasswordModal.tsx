import React, { useState } from 'react';
import { authService } from '../../services/authService';
import type { ForgotPasswordRequest, ResetPasswordRequest } from '../../services/authService';
import styles from './AuthModal.module.css';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const request: ForgotPasswordRequest = { usernameOrEmail: email };
    const result = await authService.forgotPassword(request);
    setLoading(false);
    if (result) {
      setStep('reset');
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }
    setLoading(true);
    const request: ResetPasswordRequest = {
      usernameOrEmail: email,
      resetCode,
      newPassword,
      confirmPassword,
    };
    const result = await authService.resetPassword(request);
    setLoading(false);
    if (result) {
      onClose();
      // Reset form
      setStep('email');
      setEmail('');
      setResetCode('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form
    setStep('email');
    setEmail('');
    setResetCode('');
    setNewPassword('');
    setConfirmPassword('');
  };

  if (!isOpen) return null;

  return (
    <div className={styles['modal-overlay']} onClick={handleClose}>
      <div className={styles['modal-content']} onClick={(e) => e.stopPropagation()}>
        <h2>Quên mật khẩu</h2>
        {step === 'email' ? (
          <form onSubmit={handleEmailSubmit}>
            <input
              type="text"
              placeholder="Email hoặc tên đăng nhập"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Đang gửi...' : 'Gửi mã xác nhận'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetSubmit}>
            <input
              type="text"
              placeholder="Mã xác nhận"
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Xác nhận mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
            </button>
            <button type="button" onClick={() => setStep('email')} className={styles['back-btn']}>
              Quay lại
            </button>
          </form>
        )}
        <button className={styles['close-btn']} onClick={handleClose}>Đóng</button>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;