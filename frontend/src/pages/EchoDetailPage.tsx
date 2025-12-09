import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import styles from './EchoDetailPage.module.css';
import { apiFetch } from '../utils/apiHelper';

type SetEcho = {
  id: number;
  name: string;
  skill: string;
  icon: string;
  isActive: boolean;
  createdDate: string;
};

type Echo = {
  id: number;
  name: string;
  description: string;
  cost: number;
  skill: string;
  imageUrl: string;
  active: boolean;
  setEchoIds: number[];
};

const EchoDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [echo, setEcho] = useState<Echo | null>(null);
  const [setEchoes, setSetEchoes] = useState<SetEcho[]>([]);
  const [hoveredSetEcho, setHoveredSetEcho] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Background image logic
  const [backgrounds, setBackgrounds] = useState<string[]>([]);
  const [currentBg, setCurrentBg] = useState('');

  useEffect(() => {
    // Fetch backgrounds
    apiFetch('background')
      .then(response => response.json())
      .then(data => {
        const bgUrls = Array.isArray(data) && data.length > 0 && typeof data[0] === 'object'
          ? data.map((item: { filename: string; url: string }) => item.url)
          : data.map((file: string) => `/uploads/background/${file}`);
        setBackgrounds(bgUrls);
        if (bgUrls.length > 0) {
          setCurrentBg(bgUrls[Math.floor(Math.random() * bgUrls.length)]);
        }
      })
      .catch(error => console.error('Error fetching backgrounds:', error));

    // Fetch echo details
    if (id) {
      apiFetch(`echoes/${id}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Echo not found');
          }
          return response.json();
        })
        .then(data => {
          setEcho(data);
          
          // Fetch Set Echoes if setEchoIds exist
          if (data.setEchoIds && data.setEchoIds.length > 0) {
            apiFetch('set-echoes/active')
              .then(res => res.json())
              .then(setEchoData => {
                const relatedSets = setEchoData.filter((se: SetEcho) => 
                  data.setEchoIds.includes(se.id)
                );
                setSetEchoes(relatedSets);
              })
              .catch(err => console.error('Error fetching set echoes:', err));
          }
          
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [id]);

  useEffect(() => {
    if (backgrounds.length > 0) {
      const interval = setInterval(() => {
        setCurrentBg(backgrounds[Math.floor(Math.random() * backgrounds.length)]);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [backgrounds]);

  if (loading) {
    return (
      <>
        <Header />
        <div className={styles.container}>
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
          }}>
            <AnimatePresence mode="popLayout">
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
            </AnimatePresence>
          </div>
          <div className={styles.contentWrapper}>
            <div className={styles.loading}>Đang tải...</div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !echo) {
    return (
      <>
        <Header />
        <div className={styles.container}>
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
          }}>
            <AnimatePresence mode="popLayout">
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
            </AnimatePresence>
          </div>
          <div className={styles.contentWrapper}>
            <div className={styles.error}>
              <h2>Echo không tồn tại</h2>
              <button onClick={() => navigate('/echoes')} className={styles.backBtn}>
                ← Quay lại danh sách Echo
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className={styles.container}>
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
        }}>
          <AnimatePresence mode="popLayout">
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
          </AnimatePresence>
        </div>

        <div className={styles.contentWrapper}>
          <button onClick={() => navigate('/echoes')} className={styles.backBtn}>
            ← Quay lại danh sách Echo
          </button>

          <div className={styles.detailCard}>
            <div className={styles.topSection}>
              {/* Left - Image */}
              <div className={styles.imageSection}>
                {echo.imageUrl ? (
                  <img 
                    src={echo.imageUrl} 
                    alt={echo.name}
                    className={styles.echoImage}
                  />
                ) : (
                  <div className={styles.placeholder}>?</div>
                )}
                <div className={styles.costBadge}>{echo.cost} Cost</div>
                
                {/* Set Echo Icons below image */}
                {setEchoes.length > 0 && (
                  <div className={styles.setEchoIcons}>
                    {setEchoes.map(setEcho => (
                      <div 
                        key={setEcho.id} 
                        className={styles.setEchoIconWrapper}
                        onMouseEnter={() => setHoveredSetEcho(setEcho.id)}
                        onMouseLeave={() => setHoveredSetEcho(null)}
                      >
                        <img 
                          src={setEcho.icon} 
                          alt={setEcho.name}
                          className={styles.setEchoIcon}
                        />
                        {hoveredSetEcho === setEcho.id && (
                          <div className={styles.setEchoTooltip}>
                            <div className={styles.tooltipTitle}>{setEcho.name}</div>
                            <div className={styles.tooltipContent}>
                              {setEcho.skill}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right - Info */}
              <div className={styles.infoSection}>
                <h1 className={styles.name}>{echo.name}</h1>
                
                {echo.skill && (
                  <div className={styles.skillSection}>
                    <h3>Kỹ năng Echo</h3>
                    <div className={styles.skillContent}>
                      {echo.skill}
                    </div>
                  </div>
                )}

                {echo.description && (
                  <div className={styles.description}>
                    <h3>Mô tả</h3>
                    <p>{echo.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default EchoDetailPage;
