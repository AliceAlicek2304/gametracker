import React from 'react';
import styles from './Footer.module.css';

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles['footer-container']}>
        <div className={styles.footerGrid}>
          <div className={styles.col}>
            <h4>Liên hệ</h4>
            <p>Game Tracker — Ứng dụng tài nguyên & đồng hành cùng Wuthering Waves</p>
            <p>Email: <a href="mailto:alicek23004@gmail.com">alicek23004@gmail.com</a></p>
          </div>

          <div className={styles.col}>
            <h4>Giới thiệu</h4>
            <ul>
              <li><a href="#">Về Chúng Tôi</a></li>
              <li><a href="#">Điều Khoản Sử Dụng</a></li>
              <li><a href="#">Chính Sách Bảo Mật</a></li>
            </ul>
          </div>

          <div className={styles.col}>
            <h4>Tổng quan</h4>
            <ul>
              <li><a href="/tracker">Tracker</a></li>
              <li><a href="/characters">Nhân Vật</a></li>
              <li><a href="/weapons">Vũ Khí</a></li>
              <li><a href="/events">Event</a></li>
              <li><a href="/banners">Banner</a></li>
            </ul>
          </div>
        </div>

        <div className={styles.copy}>&copy; 2025 Game Tracker. All rights reserved.</div>
      </div>
    </footer>
  );
};

export default Footer;