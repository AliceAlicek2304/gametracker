import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { getElementIconUrlSync, preloadElementIcons } from '../utils/elementIcons';
import styles from './HomePage.module.css';

interface Character {
  id: number;
  name: string;
  imageUrl: string;
  rarity: number;
  element: string;
  elementName: string;
  weaponName: string;
}

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

const HomePage: React.FC = () => {
  const [backgrounds, setBackgrounds] = useState<string[]>([]);
  const [currentBg, setCurrentBg] = useState('');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [hoveredBanner, setHoveredBanner] = useState<number | null>(null);
  const [featuredCharacterIds, setFeaturedCharacterIds] = useState<Set<number>>(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    // Preload element icons for faster rendering
    preloadElementIcons();

    // Fetch backgrounds - supports both local and S3 mode
    fetch('/api/background')
      .then(response => response.json())
      .then(data => {
        // Check if response is array of objects {filename, url} or array of strings
        const bgUrls = Array.isArray(data) && data.length > 0 && typeof data[0] === 'object'
          ? data.map((item: { filename: string; url: string }) => item.url) // S3 mode
          : data.map((file: string) => `/uploads/background/${file}`); // Local mode
        setBackgrounds(bgUrls);
        if (bgUrls.length > 0) {
          setCurrentBg(bgUrls[Math.floor(Math.random() * bgUrls.length)]);
        }
      })
      .catch(error => console.error('Error fetching backgrounds:', error));

    // Fetch featured 5-star IDs from active banners
    fetch('/api/banners/featured-ids')
      .then(response => response.json())
      .then(data => {
        setFeaturedCharacterIds(new Set(data.characterIds || []));
      })
      .catch(error => console.error('Error fetching featured IDs:', error));

    // Fetch latest 12 characters
    fetch('/api/characters')
      .then(response => response.json())
      .then(data => {
        const sorted = data.sort((a: Character, b: Character) => b.id - a.id);
        setCharacters(sorted.slice(0, 12)); 
      })
      .catch(error => console.error('Error fetching characters:', error));

    // Fetch active banners
    fetch('/api/banners')
      .then(response => response.json())
      .then(data => {
        const activeBanners = data.filter((b: Banner) => b.status === 'ACTIVE');
        setBanners(activeBanners);
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

  const getElementIcon = (element: string) => {
    return getElementIconUrlSync(element);
  };

  const getRarityStars = (rarity: number) => '★'.repeat(rarity);

  return (
    <div className={styles.homepage} style={{ backgroundImage: `url(${currentBg})` }}>
      <Header />
      <main className={styles.mainContent}>
        <div className={styles.heroSection}>
          <h1 className={styles.heroTitle}>Welcome to Game Tracker</h1>
          <p className={styles.heroSubtitle}>Track your favorite games and more!</p>
        </div>

        <div className={styles.container}>
          <div className={styles.leftSection}>
            <div className={styles.quickNav}>
              <div className={styles.quickNavHeader}>
                Điều Hướng Nhanh
              </div>
              <div className={styles.quickNavButtons}>
                <button className={styles.navBtn} onClick={() => navigate('/characters')}>
                  <img src="/icons/character-icon.png" alt="Character" className={styles.navIcon} />
                  <span>Nhân Vật</span>
                </button>
                <button className={styles.navBtn} onClick={() => navigate('/weapons')}>
                  <img src="/icons/weapon-icon.png" alt="Weapon" className={styles.navIcon} />
                  <span>Vũ Khí</span>
                </button>
                <button className={styles.navBtn} onClick={() => navigate('/tracker')}>
                  <img src="/icons/roll-tracker-icon.png" alt="Tracker" className={styles.navIcon} />
                  <span>Roll Tracker</span>
                </button>
              </div>
            </div>

            <div className={styles.charactersSection}>
              <div className={styles.sectionHeader}>
                Nhân Vật
                <button className={styles.viewAllBtn} onClick={() => navigate('/characters')}>
                  Chi tiết &gt;
                </button>
              </div>
              <div className={styles.characterGrid}>
                {characters.map(char => (
                  <div 
                    key={char.id} 
                    className={styles.characterCard}
                    onClick={() => navigate(`/characters/${char.id}`)}
                  >
                    <div className={styles.characterImageWrapper}>
                      <img
                        src={char.imageUrl}
                        alt={char.name}
                        className={styles.characterImage}
                      />
                      {getElementIcon(char.element) && (
                        <div className={styles.elementIcon}>
                          <img 
                            src={getElementIcon(char.element)!} 
                            alt={char.element}
                            className={styles.elementIconImg}
                          />
                        </div>
                      )}
                      {featuredCharacterIds.has(char.id) && (
                        <div className={styles.bannerBadge}>Banner</div>
                      )}
                      <div className={styles.rarity}>
                        {getRarityStars(char.rarity)}
                      </div>
                    </div>
                    <div className={styles.characterName}>{char.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.rightSection}>
            <div className={styles.bannersHeader}>
              Banners
            </div>
            <div className={styles.bannersContainer}>
              {banners.map(banner => (
                <div 
                  key={banner.id} 
                  className={styles.bannerCard}
                  onClick={() => navigate('/banners')}
                  onMouseEnter={() => setHoveredBanner(banner.id)}
                  onMouseLeave={() => setHoveredBanner(null)}
                >
                  <div className={styles.bannerTitle}>
                    {banner.name}
                  </div>
                  <div className={styles.bannerDates}>
                    {new Date(banner.startDate).toLocaleDateString('vi-VN')} - {new Date(banner.endDate).toLocaleDateString('vi-VN')}
                  </div>
                  <div className={styles.bannerTimeLeft}>
                    Kết thúc sau: {Math.ceil((new Date(banner.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} ngày {Math.floor(((new Date(banner.endDate).getTime() - Date.now()) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))} giờ {Math.floor(((new Date(banner.endDate).getTime() - Date.now()) % (1000 * 60 * 60)) / (1000 * 60))} phút
                  </div>
                  <div className={styles.bannerContent}>
                    <div className={styles.bannerMain}>
                      <img 
                        src={banner.bannerType === 'CHARACTER' ? banner.featured5StarCharacterImageUrl : banner.featured5StarWeaponImageUrl} 
                        alt="Featured" 
                        className={styles.mainImage}
                      />
                    </div>
                    <div className={styles.bannerSub}>
                      <img 
                        src={banner.bannerType === 'CHARACTER' ? banner.featured4StarCharacter1ImageUrl : banner.featured4StarWeapon1ImageUrl} 
                        alt="Sub 1"
                        className={styles.subImage}
                      />
                      <img 
                        src={banner.bannerType === 'CHARACTER' ? banner.featured4StarCharacter2ImageUrl : banner.featured4StarWeapon2ImageUrl} 
                        alt="Sub 2"
                        className={styles.subImage}
                      />
                      <img 
                        src={banner.bannerType === 'CHARACTER' ? banner.featured4StarCharacter3ImageUrl : banner.featured4StarWeapon3ImageUrl} 
                        alt="Sub 3"
                        className={styles.subImage}
                      />
                    </div>
                  </div>

                  {hoveredBanner === banner.id && (
                    <div className={styles.bannerPopup}>
                      <div className={styles.popupHeader}>
                        {banner.bannerType === 'CHARACTER' ? 'Nhân Vật' : 'Vũ Khí'}
                      </div>
                      <div className={styles.popupContent}>
                        <div className={styles.popupFeatured}>
                          <div className={styles.popupStar}>Featured 5★</div>
                          <div className={styles.popupName}>
                            {banner.bannerType === 'CHARACTER' 
                              ? banner.featured5StarCharacterName 
                              : banner.featured5StarWeaponName}
                          </div>
                        </div>
                        <div className={styles.popupDivider}></div>
                        <div className={styles.popupRateUp}>
                          <div className={styles.popupStar}>Rate-Up 4★</div>
                          <div className={styles.popupNames}>
                            <div className={styles.popupName}>
                              {banner.bannerType === 'CHARACTER' 
                                ? banner.featured4StarCharacter1Name 
                                : banner.featured4StarWeapon1Name}
                            </div>
                            <div className={styles.popupName}>
                              {banner.bannerType === 'CHARACTER' 
                                ? banner.featured4StarCharacter2Name 
                                : banner.featured4StarWeapon2Name}
                            </div>
                            <div className={styles.popupName}>
                              {banner.bannerType === 'CHARACTER' 
                                ? banner.featured4StarCharacter3Name 
                                : banner.featured4StarWeapon3Name}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;