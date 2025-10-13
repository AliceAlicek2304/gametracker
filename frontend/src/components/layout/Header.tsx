import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import LoginModal from '../auth/LoginModal';
import RegisterModal from '../auth/RegisterModal';
import ForgotPasswordModal from '../auth/ForgotPasswordModal';
import styles from './Header.module.css';

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (e.target instanceof Node && !menuRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
    };
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, []);

  return (
    <>
      <header className={styles.header}>
        <div className={styles['header-container']}>
          <div className={styles.logo}>
            <a href="/" className={styles['logo-link']}>
              <span className={styles.icon}>🎮</span>
              <span className={styles.title}>Game Tracker</span>
            </a>
          </div>
          <nav className={styles.nav}>
            <Link to="/#home" className={styles['nav-link']}>Trang chủ</Link>
            <Link to="/tracker" className={styles['nav-link']}>Tracker</Link>
          </nav>
          <div className={styles['auth-buttons']}>
            {isAuthenticated && user ? (
              <div className={styles['user-info']} ref={menuRef}>
                <button className={styles['avatar-btn']} onClick={(e) => { e.stopPropagation(); setOpenMenu(prev => !prev); }}>
                  <img
                    src={
                      (!user.avatar || user.avatar.endsWith('default-avatar.jpg')) ? '/default-avatar.svg' : user.avatar
                    }
                    alt="Avatar"
                    className={styles['user-avatar']}
                  />
                </button>
                {openMenu && (
                  <div className={styles['avatar-dropdown']}>
                    <button className={styles['dropdown-item']} onClick={() => { setOpenMenu(false); navigate('/profile'); }}>
                      Hồ sơ
                    </button>
                    {user.roles && user.roles.includes('ROLE_ADMIN') && (
                      <button className={styles['dropdown-item']} onClick={() => { setOpenMenu(false); navigate('/admin/dashboard'); }}>
                        Dashboard
                      </button>
                    )}
                    <button className={styles['dropdown-item']} onClick={() => { setOpenMenu(false); logout(); }}>
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button className={styles['btn-login']} onClick={() => setShowLogin(true)}>Đăng nhập</button>
                <button className={styles['btn-register']} onClick={() => setShowRegister(true)}>Đăng ký</button>
              </>
            )}
          </div>
        </div>
      </header>
      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onForgotPassword={() => { setShowLogin(false); setShowForgot(true); }}
        onOpenRegister={() => { setShowLogin(false); setShowRegister(true); }}
      />
      <RegisterModal isOpen={showRegister} onClose={() => setShowRegister(false)} />
      <ForgotPasswordModal isOpen={showForgot} onClose={() => setShowForgot(false)} />
    </>
  );
};

export default Header;