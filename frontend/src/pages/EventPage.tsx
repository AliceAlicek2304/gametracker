import React, { useEffect, useState } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import styles from './EventPage.module.css';
import EventTimeline from '../components/EventTimeline';
import { apiFetch } from '../utils/apiHelper';

const EventPage: React.FC = () => {
  const [backgrounds, setBackgrounds] = useState<string[]>([]);
  const [currentBg, setCurrentBg] = useState('');

  useEffect(() => {
    apiFetch('background')
      .then(res => res.json())
      .then(data => {
        const bgUrls = Array.isArray(data) && data.length > 0 && typeof data[0] === 'object'
          ? data.map((item: { filename: string; url: string }) => item.url)
          : data.map((file: string) => `/uploads/background/${file}`);
        setBackgrounds(bgUrls);
        if (bgUrls.length > 0) setCurrentBg(bgUrls[Math.floor(Math.random() * bgUrls.length)]);
      })
      .catch(err => console.error('Error fetching backgrounds:', err));
  }, []);

  useEffect(() => {
    if (backgrounds.length === 0) return;
    const id = setInterval(() => {
      setCurrentBg(backgrounds[Math.floor(Math.random() * backgrounds.length)]);
    }, 10000);
    return () => clearInterval(id);
  }, [backgrounds]);

  return (
    <div className={styles.eventPage} style={{ backgroundImage: currentBg ? `url(${currentBg})` : undefined }}>
      <Header />
      <main className={styles.mainContent}>
        <div className={styles.container}>
          <h1>Sự kiện</h1>
          <EventTimeline />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EventPage;
