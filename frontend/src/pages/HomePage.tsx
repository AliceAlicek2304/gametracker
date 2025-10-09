import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import styles from './HomePage.module.css';

const HomePage: React.FC = () => {
  const [backgrounds, setBackgrounds] = useState<string[]>([]);
  const [currentBg, setCurrentBg] = useState('');

  useEffect(() => {
    // Fetch list of background files
    fetch('/api/background')
      .then(response => response.json())
      .then(data => {
        const bgUrls = data.map((file: string) => `/uploads/background/${file}`);
        setBackgrounds(bgUrls);
        if (bgUrls.length > 0) {
          setCurrentBg(bgUrls[Math.floor(Math.random() * bgUrls.length)]);
        }
      })
      .catch(error => console.error('Error fetching backgrounds:', error));
  }, []);

  useEffect(() => {
    if (backgrounds.length > 0) {
      const interval = setInterval(() => {
        setCurrentBg(backgrounds[Math.floor(Math.random() * backgrounds.length)]);
      }, 10000); // Change every 10 seconds

      return () => clearInterval(interval);
    }
  }, [backgrounds]);

  // Scroll to hash (e.g. /#home) when location changes
  const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location]);

  return (
    <div className={styles.homepage} style={{ backgroundImage: `url(${currentBg})` }}>
      <Header />
      <main className={styles['main-content']}>
        <h1>Welcome to Game Tracker</h1>
        <p>Track your favorite games and more!</p>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;