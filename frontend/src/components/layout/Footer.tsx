import React from 'react';
import styles from './Footer.module.css';

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles['footer-container']}>
        <p>&copy; 2025 Game Tracker. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;