import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    <div className={styles.eventPage}>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}>
        <AnimatePresence mode="popLayout">
          {currentBg && (
            <motion.div
              key={currentBg}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: `url(${currentBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
              }}
            />
          )}
        </AnimatePresence>
      </div>
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
