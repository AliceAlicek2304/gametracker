import React, { useEffect, useState } from 'react';
import styles from './UnauthorizedModal.module.css';
import { useAuth } from '../contexts/AuthContext';

const UnauthorizedModal: React.FC = () => {
  const [open, setOpen] = useState(false);
  const auth = useAuth();

  useEffect(() => {
    const handler = () => { setOpen(true); };
    window.addEventListener('app:unauthorized', handler as EventListener);
    return () => window.removeEventListener('app:unauthorized', handler as EventListener);
  }, []);

  const onLogin = () => {
    // clear stored tokens and redirect to login (or show login flow)
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (auth && typeof auth.logout === 'function') auth.logout();
    setOpen(false);
    // Try to open login modal first by dispatching an event.
    try {
      window.dispatchEvent(new CustomEvent('app:open-login-modal'));
      return;
    } catch (e) { /* ignore */ }
    window.location.href = '/login';
  };

  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3>Phiên đăng nhập đã hết hạn</h3>
  <p>Yêu cầu bạn đăng nhập lại để tiếp tục.</p>
        <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
          <button className={styles.btn} onClick={() => setOpen(false)}>Đóng</button>
          <button className={`${styles.btn} ${styles.primary}`} onClick={onLogin}>Đăng nhập lại</button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedModal;
