import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import styles from './CharacterPage.module.css';
import { apiFetch } from '../utils/apiHelper';

type Weapon = {
  id: number;
  name: string;
  type: string;
  imageUrl: string;
  rarity: number;
};

const WeaponPage: React.FC = () => {
  const navigate = useNavigate();
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [featuredWeaponIds, setFeaturedWeaponIds] = useState<Set<number>>(new Set());
  const itemsPerPage = 28;

  // Background image logic
  const [backgrounds, setBackgrounds] = useState<string[]>([]);
  const [currentBg, setCurrentBg] = useState('');

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

    // Fetch featured 5-star IDs from active banners
    apiFetch('banners/featured-ids')
      .then(response => response.json())
      .then(data => {
        setFeaturedWeaponIds(new Set(data.weaponIds || []));
      })
      .catch(error => console.error('Error fetching featured IDs:', error));

    // Fetch weapons
    apiFetch('weapons/cards')
      .then(response => response.json())
      .then(data => {
        // Sort by ID descending (newest first)
        const sortedData = data.sort((a: Weapon, b: Weapon) => b.id - a.id);
        setWeapons(sortedData);
        setLoading(false);
      })
      .catch(err => {
        setError('Không thể tải danh sách vũ khí');
        setLoading(false);
        console.error('Error fetching weapons:', err);
      });
  }, []);

  useEffect(() => {
    if (backgrounds.length > 0) {
      const interval = setInterval(() => {
        setCurrentBg(backgrounds[Math.floor(Math.random() * backgrounds.length)]);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [backgrounds]);

  // Get unique types and rarities for filters
  const types = ['all', ...Array.from(new Set(weapons.map(w => w.type)))];
  const rarities = ['all', ...Array.from(new Set(weapons.map(w => w.rarity))).sort((a, b) => b - a)];

  // Filter weapons
  const filteredWeapons = weapons.filter(weapon => {
    const matchesSearch = weapon.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || weapon.type === selectedType;
    const matchesRarity = selectedRarity === 'all' || weapon.rarity === parseInt(selectedRarity);
    return matchesSearch && matchesType && matchesRarity;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredWeapons.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedWeapons = filteredWeapons.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedType, selectedRarity]);

  return (
    <>
      <Header />
      <div className={styles.container} style={{ backgroundImage: `url(${currentBg})` }}>
        <div className={styles.contentWrapper}>
          <h1 className={styles.title}>Danh Sách Vũ Khí</h1>
          <p className={styles.subtitle}>Khám phá tất cả các vũ khí trong game</p>

          {/* Filter Section */}
          <div className={styles.filterSection}>
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="🔍 Tìm kiếm vũ khí..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Loại Vũ Khí:</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className={styles.filterSelect}
              >
                {types.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'Tất cả' : type}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Cấp Sao:</label>
              <select
                value={selectedRarity}
                onChange={(e) => setSelectedRarity(e.target.value)}
                className={styles.filterSelect}
              >
                {rarities.map(rarity => (
                  <option key={rarity} value={rarity}>
                    {rarity === 'all' ? 'Tất cả' : `${rarity} ★`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Weapon Grid */}
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Đang tải vũ khí...</p>
            </div>
          ) : error ? (
            <div className={styles.error}>
              <p>{error}</p>
            </div>
          ) : (
            <>
              <div className={styles.characterGrid}>
                {paginatedWeapons.map(weapon => (
                  <div 
                    key={weapon.id} 
                    className={styles.characterCard}
                    onClick={() => navigate(`/weapons/${weapon.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={styles.characterImageWrapper}>
                      <img
                        src={weapon.imageUrl}
                        alt={weapon.name}
                        className={styles.characterImage}
                      />
                      {featuredWeaponIds.has(weapon.id) && (
                        <div className={styles.bannerBadge}>Banner</div>
                      )}
                      <div className={styles.rarity}>
                        {'★'.repeat(weapon.rarity)}
                      </div>
                    </div>
                    <div className={styles.characterName}>{weapon.name}</div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    className={styles.pageButton}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    ← Trước
                  </button>
                  
                  <div className={styles.pageNumbers}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        className={`${styles.pageNumber} ${currentPage === page ? styles.active : ''}`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    className={styles.pageButton}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Tiếp →
                  </button>
                </div>
              )}
            </>
          )}

          {filteredWeapons.length === 0 && !loading && (
            <div className={styles.noResults}>
              <p>Không tìm thấy vũ khí nào phù hợp</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default WeaponPage;
