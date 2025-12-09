import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
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
  const location = useLocation();
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
            <Link 
              to="/" 
              className={`${styles['nav-link']} ${location.pathname === '/' ? styles['nav-link-active'] : ''}`}
            >
              Trang chủ
            </Link>
            <Link 
              to="/characters" 
              className={`${styles['nav-link']} ${location.pathname.startsWith('/characters') ? styles['nav-link-active'] : ''}`}
            >
              Nhân vật
            </Link>
            
            {/* Resources Dropdown */}
            <div className={styles['nav-dropdown']}>
              <div className={`${styles['nav-link']} ${(location.pathname.startsWith('/weapons') || location.pathname.startsWith('/echoes')) ? styles['nav-link-active'] : ''}`}>
                Tài nguyên ▼
              </div>
              <div className={styles['dropdown-menu']}>
                <Link to="/weapons" className={styles['dropdown-item']}>
                  Vũ khí
                </Link>
                <Link to="/echoes" className={styles['dropdown-item']}>
                  Echo
                </Link>
              </div>
            </div>

            <Link 
              to="/events" 
              className={`${styles['nav-link']} ${location.pathname === '/events' ? styles['nav-link-active'] : ''}`}
            >
              Sự kiện
            </Link>

            {/* Tools Dropdown */}
            <div className={styles['nav-dropdown']}>
              <div className={`${styles['nav-link']} ${(location.pathname.startsWith('/banners') || location.pathname.startsWith('/tracker')) ? styles['nav-link-active'] : ''}`}>
                Công cụ ▼
              </div>
              <div className={styles['dropdown-menu']}>
                <Link to="/banners" className={styles['dropdown-item']}>
                  Banner
                </Link>
                <Link to="/tracker" className={styles['dropdown-item']}>
                  Tracker
                </Link>
              </div>
            </div>
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
                    <div className={styles['dropdown-header']}>
                      <img
                        src={
                          (!user.avatar || user.avatar.endsWith('default-avatar.jpg')) ? '/default-avatar.svg' : user.avatar
                        }
                        alt="Avatar"
                        className={styles['dropdown-avatar']}
                      />
                      <div className={styles['dropdown-user-info']}>
                        <div className={styles['dropdown-username']}>{user.username}</div>
                        <div className={styles['dropdown-email']}>{user.email}</div>
                      </div>
                    </div>
                    <div className={styles['dropdown-divider']}></div>
                    <button className={styles['dropdown-item']} onClick={() => { setOpenMenu(false); navigate('/profile'); }}>
                      <span className={styles['dropdown-icon']}>👤</span>
                      Hồ sơ
                    </button>
                    {user.roles && user.roles.includes('ROLE_ADMIN') && (
                      <button className={styles['dropdown-item']} onClick={() => { setOpenMenu(false); navigate('/admin/dashboard'); }}>
                        <span className={styles['dropdown-icon']}>📊</span>
                        Dashboard
                      </button>
                    )}
                    <div className={styles['dropdown-divider']}></div>
                    <button className={styles['dropdown-item']} onClick={() => { setOpenMenu(false); logout(); }}>
                      <span className={styles['dropdown-icon']}>🚪</span>
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className={styles['btn-user-icon']} onClick={() => setShowLogin(true)}>
                <span className={styles['user-icon']}>👤</span>
              </button>
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