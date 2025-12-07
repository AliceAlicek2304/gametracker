import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ConveneRulesModal from '../components/ConveneRulesModal';
import GachaResultModal from '../components/GachaResultModal';
import styles from './BannerPage.module.css';
import { apiFetch } from '../utils/apiHelper';

interface Banner {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  bannerType: 'CHARACTER' | 'WEAPON';
  featured5StarCharacterName?: string;
  featured5StarCharacterImageUrl?: string;
  featured4StarCharacter1Name?: string;
  featured4StarCharacter1ImageUrl?: string;
  featured4StarCharacter2Name?: string;
  featured4StarCharacter2ImageUrl?: string;
  featured4StarCharacter3Name?: string;
  featured4StarCharacter3ImageUrl?: string;
  featured5StarWeaponName?: string;
  featured5StarWeaponImageUrl?: string;
  featured4StarWeapon1Name?: string;
  featured4StarWeapon1ImageUrl?: string;
  featured4StarWeapon2Name?: string;
  featured4StarWeapon2ImageUrl?: string;
  featured4StarWeapon3Name?: string;
  featured4StarWeapon3ImageUrl?: string;
  status: string;
}

interface GachaItem {
  id: number;
  name: string;
  imageUrl: string;
  rarity: number;
  type: 'CHARACTER' | 'WEAPON';
  element?: string;
  weaponType?: string;
  isNew: boolean;
  isFeatured: boolean;
}

interface PityState {
  pity5Star: number;
  pity4Star: number;
  guaranteed5StarFeatured: boolean;
  guaranteed4StarFeatured: boolean;
}

const BannerPage: React.FC = () => {
  const [currentBanners, setCurrentBanners] = useState<Banner[]>([]);
  const [upcomingBanners, setUpcomingBanners] = useState<Banner[]>([]);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [backgrounds, setBackgrounds] = useState<string[]>([]);
  const [currentBg, setCurrentBg] = useState('');
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [gachaResults, setGachaResults] = useState<GachaItem[]>([]);
  const [showGachaModal, setShowGachaModal] = useState(false);
  const [isRolling, setIsRolling] = useState(false);

  // Load pity from localStorage
  const getPityState = (bannerId: number): PityState => {
    const key = `gacha_pity_${bannerId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      pity5Star: 0,
      pity4Star: 0,
      guaranteed5StarFeatured: false,
      guaranteed4StarFeatured: false
    };
  };

  // Save pity to localStorage
  const savePityState = (bannerId: number, pity: PityState) => {
    const key = `gacha_pity_${bannerId}`;
    localStorage.setItem(key, JSON.stringify(pity));
  };

  useEffect(() => {
    // Fetch backgrounds
    apiFetch('background')
      .then(response => response.json())
      .then(data => {
        // Check if response is array of objects {filename, url} or array of strings
        const bgUrls = Array.isArray(data) && data.length > 0 && typeof data[0] === 'object'
          ? data.map((item: { filename: string; url: string }) => item.url) // S3 mode
          : data.map((file: string) => `/uploads/background/${file}`); // Local mode fallback
        setBackgrounds(bgUrls);
        if (bgUrls.length > 0) {
          setCurrentBg(bgUrls[Math.floor(Math.random() * bgUrls.length)]);
        }
      })
      .catch(error => console.error('Error fetching backgrounds:', error));

    // Fetch all banners (show both ACTIVE and UPCOMING)
    apiFetch('banners')
      .then(response => response.json())
      .then((data: Banner[]) => {
        // Filter by status - show ACTIVE and UPCOMING, hide ENDED
        const current = data.filter(b => b.status === 'ACTIVE');
        const upcoming = data.filter(b => b.status === 'UPCOMING');
        setCurrentBanners(current);
        setUpcomingBanners(upcoming);
        // Auto-select first banner (prioritize ACTIVE, fallback to UPCOMING)
        if (current.length > 0) {
          setSelectedBanner(current[0]);
        } else if (upcoming.length > 0) {
          setSelectedBanner(upcoming[0]);
        }
      })
      .catch(error => console.error('Error fetching banners:', error));
  }, []);

  useEffect(() => {
    if (backgrounds.length > 0) {
      const interval = setInterval(() => {
        setCurrentBg(backgrounds[Math.floor(Math.random() * backgrounds.length)]);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [backgrounds]);

  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate).getTime();
    const now = Date.now();
    const diff = end - now;

    if (diff <= 0) return 'Đã kết thúc';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return `${days}d ${hours}h`;
  };

  const getTimeUntilStart = (startDate: string) => {
    const start = new Date(startDate).getTime();
    const now = Date.now();
    const diff = start - now;

    if (diff <= 0) return 'Đã bắt đầu';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return `${days}d ${hours}h`;
  };

  const handleRollOne = async () => {
    if (!selectedBanner || isRolling) return;
    
    setIsRolling(true);
    
    try {
      const currentPity = getPityState(selectedBanner.id);
      
      const response = await apiFetch('banners/gacha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bannerId: selectedBanner.id,
          count: 1,
          pity5Star: currentPity.pity5Star,
          pity4Star: currentPity.pity4Star,
          guaranteed5StarFeatured: currentPity.guaranteed5StarFeatured,
          guaranteed4StarFeatured: currentPity.guaranteed4StarFeatured
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Save updated pity to localStorage
        savePityState(selectedBanner.id, {
          pity5Star: result.pity5Star,
          pity4Star: result.pity4Star,
          guaranteed5StarFeatured: result.guaranteed5StarFeatured,
          guaranteed4StarFeatured: result.guaranteed4StarFeatured
        });
        
        // Set results and show modal
        setGachaResults(result.items);
        setShowGachaModal(true);
      } else {
        console.error('Gacha failed');
      }
    } catch (error) {
      console.error('Error performing gacha:', error);
    } finally {
      setIsRolling(false);
    }
  };

  const handleRollTen = async () => {
    if (!selectedBanner || isRolling) return;
    
    setIsRolling(true);
    
    try {
      const currentPity = getPityState(selectedBanner.id);
      
      const response = await apiFetch('banners/gacha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bannerId: selectedBanner.id,
          count: 10,
          pity5Star: currentPity.pity5Star,
          pity4Star: currentPity.pity4Star,
          guaranteed5StarFeatured: currentPity.guaranteed5StarFeatured,
          guaranteed4StarFeatured: currentPity.guaranteed4StarFeatured
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Save updated pity to localStorage
        savePityState(selectedBanner.id, {
          pity5Star: result.pity5Star,
          pity4Star: result.pity4Star,
          guaranteed5StarFeatured: result.guaranteed5StarFeatured,
          guaranteed4StarFeatured: result.guaranteed4StarFeatured
        });
        
        // Set results and show modal
        setGachaResults(result.items);
        setShowGachaModal(true);
      } else {
        console.error('Gacha failed');
      }
    } catch (error) {
      console.error('Error performing gacha:', error);
    } finally {
      setIsRolling(false);
    }
  };

  return (
    <div className={styles.bannerPage} style={{ backgroundImage: `url(${currentBg})` }}>
      <Header />
      <main className={styles.mainContent}>
        <div className={styles.container}>
          {/* Left Sidebar - Banner List */}
          <div className={styles.bannerList}>
            {/* Current Banners */}
            {currentBanners.length > 0 && (
              <div className={styles.bannerSection}>
                <div className={styles.sectionTitle}>🔥 ĐANG DIỄN RA</div>
                {currentBanners.map(banner => (
                  <div
                    key={banner.id}
                    className={`${styles.bannerItem} ${selectedBanner?.id === banner.id ? styles.active : ''}`}
                    onClick={() => setSelectedBanner(banner)}
                  >
                    <div className={styles.bannerItemBadge}>EVENT</div>
                    <img
                      src={banner.bannerType === 'CHARACTER' 
                        ? banner.featured5StarCharacterImageUrl 
                        : banner.featured5StarWeaponImageUrl}
                      alt={banner.name}
                      className={styles.bannerItemImage}
                    />
                    <div className={styles.bannerItemOverlay}>
                      <div className={styles.bannerItemName}>{banner.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Upcoming Banners */}
            {upcomingBanners.length > 0 && (
              <div className={styles.bannerSection}>
                <div className={styles.sectionTitle}>⏰ SẮP DIỄN RA</div>
                {upcomingBanners.map(banner => (
                  <div
                    key={banner.id}
                    className={`${styles.bannerItem} ${styles.upcomingItem} ${selectedBanner?.id === banner.id ? styles.active : ''}`}
                    onClick={() => setSelectedBanner(banner)}
                  >
                    <div className={styles.bannerItemBadge} style={{ backgroundColor: '#ff9800' }}>UPCOMING</div>
                    <img
                      src={banner.bannerType === 'CHARACTER' 
                        ? banner.featured5StarCharacterImageUrl 
                        : banner.featured5StarWeaponImageUrl}
                      alt={banner.name}
                      className={styles.bannerItemImage}
                    />
                    <div className={styles.bannerItemOverlay}>
                      <div className={styles.bannerItemName}>{banner.name}</div>
                      <div className={styles.upcomingTimer}>
                        Starts in: {getTimeUntilStart(banner.startDate)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Center - Banner Display */}
          {selectedBanner && (
            <div className={styles.bannerDisplay}>
              <div className={styles.bannerInfo}>
                <div className={styles.bannerTitle}>
                  <span className={styles.bannerLabel}>
                    {selectedBanner.bannerType === 'CHARACTER' ? 'Featured Resonator Convene' : 'Featured Weapon Convene'}
                  </span>
                  <h1 className={styles.bannerName}>{selectedBanner.name}</h1>
                  <div className={styles.bannerTimer}>
                    {selectedBanner.status === 'UPCOMING' 
                      ? `⏰ Starts in: ${getTimeUntilStart(selectedBanner.startDate)}` 
                      : `⏰ Remaining: ${getTimeRemaining(selectedBanner.endDate)}`}
                  </div>
                </div>

                <div className={styles.bannerDescriptionWrapper}>
                  <div className={styles.bannerDescription}>
                    <p>Every 10 Convenes guarantees a</p>
                    <p>4-Star or above item.</p>
                    <p>A 5-Star {selectedBanner.bannerType === 'CHARACTER' ? 'Character' : 'Weapon'} is guaranteed</p>
                    <p>within 80 Convenes.</p>
                  </div>
                  <button className={styles.rulesButton} onClick={() => setShowRulesModal(true)} title="Convene Rules">
                    ❓
                  </button>
                </div>
              </div>

              {/* Featured Display */}
              <div className={styles.featuredDisplay}>
                <div className={styles.featuredMain}>
                  <img
                    src={selectedBanner.bannerType === 'CHARACTER' 
                      ? selectedBanner.featured5StarCharacterImageUrl 
                      : selectedBanner.featured5StarWeaponImageUrl}
                    alt="Featured"
                    className={styles.featuredMainImage}
                  />
                  <div className={styles.featuredMainInfo}>
                    <div className={styles.featuredMainName}>
                      {selectedBanner.bannerType === 'CHARACTER' 
                        ? selectedBanner.featured5StarCharacterName 
                        : selectedBanner.featured5StarWeaponName}
                    </div>
                    <div className={styles.featuredMainRarity}>★★★★★</div>
                  </div>
                </div>

                {/* 4-Star Rate Up */}
                <div className={styles.rateUpSection}>
                  <div className={styles.rateUpTitle}>4-Star Resonators Rate Up</div>
                  <div className={styles.rateUpItems}>
                    <div className={styles.rateUpItem}>
                      <img
                        src={selectedBanner.bannerType === 'CHARACTER' 
                          ? selectedBanner.featured4StarCharacter1ImageUrl 
                          : selectedBanner.featured4StarWeapon1ImageUrl}
                        alt="Rate Up 1"
                        className={styles.rateUpImage}
                      />
                    </div>
                    <div className={styles.rateUpItem}>
                      <img
                        src={selectedBanner.bannerType === 'CHARACTER' 
                          ? selectedBanner.featured4StarCharacter2ImageUrl 
                          : selectedBanner.featured4StarWeapon2ImageUrl}
                        alt="Rate Up 2"
                        className={styles.rateUpImage}
                      />
                    </div>
                    <div className={styles.rateUpItem}>
                      <img
                        src={selectedBanner.bannerType === 'CHARACTER' 
                          ? selectedBanner.featured4StarCharacter3ImageUrl 
                          : selectedBanner.featured4StarWeapon3ImageUrl}
                        alt="Rate Up 3"
                        className={styles.rateUpImage}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Roll Buttons */}
              <div className={styles.rollButtons}>
                {selectedBanner.status === 'UPCOMING' ? (
                  <div className={styles.upcomingNotice}>
                    🔒 Banner chưa mở. Bắt đầu vào: {new Date(selectedBanner.startDate).toLocaleString('vi-VN')}
                  </div>
                ) : (
                  <>
                    <button className={styles.rollButton} onClick={handleRollOne} disabled={isRolling}>
                      <div className={styles.rollButtonText}>
                        <span className={styles.rollLabel}>{isRolling ? 'Rolling...' : 'Convene ×1'}</span>
                        <div className={styles.rollCost}>
                          <span>×160</span>
                          <img src="/icons/astrite-icon.png" alt="Astrite" className={styles.rollButtonIcon} />
                        </div>
                      </div>
                    </button>
                    <button className={styles.rollButton} onClick={handleRollTen} disabled={isRolling}>
                      <div className={styles.rollButtonText}>
                        <span className={styles.rollLabel}>{isRolling ? 'Rolling...' : 'Convene ×10'}</span>
                        <div className={styles.rollCost}>
                          <span>×1600</span>
                          <img src="/icons/astrite-icon.png" alt="Astrite" className={styles.rollButtonIcon} />
                        </div>
                      </div>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <ConveneRulesModal isOpen={showRulesModal} onClose={() => setShowRulesModal(false)} />
      {showGachaModal && (
        <GachaResultModal 
          items={gachaResults} 
          onClose={() => {
            setShowGachaModal(false);
            setGachaResults([]);
          }} 
        />
      )}
    </div>
  );
};

export default BannerPage;
