import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import styles from './WeaponDetailPage.module.css';
import { apiFetch } from '../utils/apiHelper';

type Weapon = {
  id: number;
  name: string;
  weaponType: string;
  imageUrl: string;
  description: string;
  mainStats: string;
  subStats: string;
  subStatsType: string;
  skill: string;
  rarity: number;
};

const WeaponDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [weapon, setWeapon] = useState<Weapon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentBg, setCurrentBg] = useState('');

  useEffect(() => {
    // Fetch background
    apiFetch('background')
      .then(response => response.json())
      .then(data => {
        // Check if response is array of objects {filename, url} or array of strings
        const bgUrls = Array.isArray(data) && data.length > 0 && typeof data[0] === 'object'
          ? data.map((item: { filename: string; url: string }) => item.url) // S3 mode
          : data.map((file: string) => `/uploads/background/${file}`); // Local mode fallback
        if (bgUrls.length > 0) {
          setCurrentBg(bgUrls[Math.floor(Math.random() * bgUrls.length)]);
        }
      })
      .catch(error => console.error('Error fetching backgrounds:', error));

    // Fetch weapon details
    apiFetch(`weapons/${id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Weapon not found');
        }
        return response.json();
      })
      .then(data => {
        setWeapon(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className={styles.page}>
        <Header />
        <div className={styles.loading}>Loading...</div>
        <Footer />
      </div>
    );
  }

  if (error || !weapon) {
    return (
      <div className={styles.page}>
        <Header />
        <div className={styles.error}>
          <h2>Weapon not found</h2>
          <button onClick={() => navigate('/weapons')} className={styles.backBtn}>
            Back to Weapons
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {currentBg && (
        <div 
          className={styles.bgImage} 
          style={{ backgroundImage: `url(${currentBg})` }}
        />
      )}
      
      <Header />
      
      <div className={styles.container}>
        <button onClick={() => navigate('/weapons')} className={styles.backBtn}>
          ← Back to Weapons
        </button>

        <div className={styles.detailCard}>
          {/* Top Row - Image and Info side by side */}
          <div className={styles.topRow}>
            {/* Left Side - Image */}
            <div className={styles.imageSection}>
              <img 
                src={weapon.imageUrl || '/placeholder-weapon.png'} 
                alt={weapon.name}
                className={styles.weaponImage}
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-weapon.png';
                }}
              />
            </div>

            {/* Right Side - Info */}
            <div className={styles.infoSection}>
              <div className={styles.header}>
                <div className={styles.headerText}>
                  <h1 className={styles.name}>{weapon.name}</h1>
                  <div className={styles.stars}>
                    {'⭐'.repeat(weapon.rarity)}
                  </div>
                  {/* Stats directly under rarity */}
                  <div className={styles.quickStats}>
                    <div className={styles.quickStatItem}>
                      {weapon.mainStats || 'N/A'}
                    </div>
                    <div className={styles.quickStatItem}>
                      {weapon.subStats || 'N/A'} {weapon.subStatsType || ''}
                    </div>
                  </div>
                </div>
              </div>

              {weapon.description && (
                <div className={styles.description}>
                  {weapon.description}
                </div>
              )}

              <div className={styles.basicInfo}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Weapon Type:</span>
                  <span className={styles.infoValue}>
                    {weapon.weaponType}
                  </span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Rarity:</span>
                  <span className={styles.infoValue}>
                    <span className={styles.stars}>{'⭐'.repeat(weapon.rarity)}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Skill Section */}
          {weapon.skill && (
            <div className={styles.skillSection}>
              <h2 className={styles.sectionTitle}>Weapon Skill</h2>
              <div className={styles.skillDescription}>
                {weapon.skill.split('**').map((part, index) => {
                  // Odd indices are inside ** **, so make them bold
                  if (index % 2 === 1) {
                    return <strong key={index}>{part}</strong>;
                  }
                  return <span key={index}>{part}</span>;
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default WeaponDetailPage;
