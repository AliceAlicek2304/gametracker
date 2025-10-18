import React, { useState, useEffect } from 'react';
import styles from './ProfilePage.module.css';
import { authService } from '../services/authService';
import type { ProfileResponse } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { apiFetch } from '../utils/apiHelper';

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [tab, setTab] = useState<'info' | 'security'>('info');
  const [backgrounds, setBackgrounds] = useState<string[]>([]);
  const [currentBg, setCurrentBg] = useState('');

  // Helper function to format date for input[type="date"]
  const formatDateForInput = (dateStr: string | undefined): string => {
    if (!dateStr) return '';
    try {
      // If already YYYY-MM-DD, return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
      
      // Try to parse other formats
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  useEffect(() => {
    // Redirect to home if not authenticated
    if (!isAuthenticated) {
      navigate('/', { replace: true });
      return;
    }
    (async () => {
      const p = await authService.getProfile();
      if (p) {
        setProfile(p);
      }
    })();
    // load backgrounds like homepage
    (async () => {
      try {
        const resp = await apiFetch('background');
        if (resp.ok) {
          const data = await resp.json();
          const bgUrls = data.map((file: string) => `/uploads/background/${file}`);
          setBackgrounds(bgUrls);
          if (bgUrls.length > 0) setCurrentBg(bgUrls[Math.floor(Math.random() * bgUrls.length)]);
        }
      } catch (err) {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    if (backgrounds.length === 0) return;
    const id = setInterval(() => {
      setCurrentBg(backgrounds[Math.floor(Math.random() * backgrounds.length)]);
    }, 10000);
    return () => clearInterval(id);
  }, [backgrounds]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fullName = (form.elements.namedItem('fullName') as HTMLInputElement).value;
    const birthday = (form.elements.namedItem('birthday') as HTMLInputElement).value;

    const updated = await authService.updateProfile({ fullName, birthDay: birthday });
    if (updated) {
      setProfile(updated);
      updateUser({ fullName: updated.fullName, avatar: updated.avatar });
    }
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const currentPassword = (form.elements.namedItem('currentPassword') as HTMLInputElement).value;
    const newPassword = (form.elements.namedItem('newPassword') as HTMLInputElement).value;
    const confirmPassword = (form.elements.namedItem('confirmPassword') as HTMLInputElement).value;
    await authService.changePassword({ currentPassword, newPassword, confirmPassword });
    form.reset();
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const newEmail = (form.elements.namedItem('newEmail') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    const ok = await authService.changeEmail({ newEmail, password });
    if (ok) form.reset();
  };

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await authService.uploadAvatar(file);
    if (url) {
      // update local user and profile
      setProfile(prev => prev ? { ...prev, avatar: url } : prev);
      updateUser({ avatar: url });
    }
  };

  return (
    <div className={styles['profile-page']} style={{ backgroundImage: currentBg ? `url(${currentBg})` : undefined }}>
      <Header />
      <main className={styles['profile-main']}>
        <div className={styles['profile-container']}>
          <h2>Hồ sơ</h2>
          <div className={styles['profile-grid']}>
            <aside className={styles['left-col']}>
              <div className={styles['left-avatar']}>
                <img src={profile?.avatar || user?.avatar || '/uploads/avatar/default-avatar.jpg'} alt="avatar" className={styles['profile-avatar']} />
                <input type="file" name="avatar" accept="image/*" onChange={handleAvatar} />
              </div>
              <nav className={styles['side-tabs']}>
                <button className={`${styles['side-tab']} ${tab === 'info' ? styles.active : ''}`} onClick={() => setTab('info')}>Thông tin</button>
                <button className={`${styles['side-tab']} ${tab === 'security' ? styles.active : ''}`} onClick={() => setTab('security')}>Bảo mật</button>
              </nav>
            </aside>

            <section className={styles['right-col']}>
              {tab === 'info' && (
                <form className={styles['profile-form']} onSubmit={handleUpdate}>
                  <div className={styles['field-row']}>
                    <label>Họ và tên</label>
                    <input name="fullName" type="text" defaultValue={profile?.fullName || user?.fullName} />
                  </div>

                  <div className={styles['field-row']}>
                    <label>Ngày sinh</label>
                    <input name="birthday" type="date" defaultValue={formatDateForInput(profile?.birthDay)} />
                  </div>

                  <div className={styles['field-row']}>
                    <label>Email</label>
                    <input name="email" type="email" defaultValue={profile?.email || user?.email} disabled />
                  </div>

                  <div className={styles.actions}>
                    <button type="submit" className={styles['btn-primary']}>Cập nhật</button>
                  </div>
                </form>
              )}

              {tab === 'security' && (
                <div className={styles['security-section']}>
                  <form onSubmit={handlePassword} className={styles['security-form']}>
                    <div className={styles['field-row']}>
                      <label>Mật khẩu hiện tại</label>
                      <input name="currentPassword" type="password" />
                    </div>
                    <div className={styles['field-row']}>
                      <label>Mật khẩu mới</label>
                      <input name="newPassword" type="password" />
                    </div>
                    <div className={styles['field-row']}>
                      <label>Xác nhận mật khẩu mới</label>
                      <input name="confirmPassword" type="password" />
                    </div>
                    <div className={styles.actions}>
                      <button type="submit" className={styles['btn-primary']}>Đổi mật khẩu</button>
                    </div>
                  </form>

                  <hr />

                  <form onSubmit={handleEmailChange} className={styles['email-form']}>
                    <div className={styles['field-row']}>
                      <label>Đổi email</label>
                      <input name="newEmail" type="email" />
                    </div>
                    <div className={styles['field-row']}>
                      <label>Mật khẩu</label>
                      <input name="password" type="password" />
                    </div>
                    <div className={styles.actions}>
                      <button type="submit" className={styles['btn-primary']}>Yêu cầu đổi email</button>
                    </div>
                  </form>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;
