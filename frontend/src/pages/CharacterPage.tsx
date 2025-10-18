import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import styles from './CharacterPage.module.css';
import { apiFetch, apiUrl } from '../utils/apiHelper';

type Character = {
  id: number;
  name: string;
  element: string;
  weaponType: string;
  imageUrl: string;
  rarity: number;
};

const CharacterPage: React.FC = () => {
  const navigate = useNavigate();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedElement, setSelectedElement] = useState<string>('all');
  const [selectedWeapon, setSelectedWeapon] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [featuredCharacterIds, setFeaturedCharacterIds] = useState<Set<number>>(new Set());
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
        setFeaturedCharacterIds(new Set(data.characterIds || []));
      })
      .catch(error => console.error('Error fetching featured IDs:', error));

    // Fetch characters
    apiFetch('characters/cards')
      .then(response => response.json())
      .then(data => {
        // Sort by ID descending (newest first)
        const sortedData = data.sort((a: Character, b: Character) => b.id - a.id);
        setCharacters(sortedData);
        setLoading(false);
      })
      .catch(err => {
        setError('Không thể tải danh sách nhân vật');
        setLoading(false);
        console.error('Error fetching characters:', err);
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

  // Get unique elements and weapons for filters
  const elements = ['all', ...Array.from(new Set(characters.map(c => c.element)))];
  const weapons = ['all', ...Array.from(new Set(characters.map(c => c.weaponType)))];
  const rarities = ['all', ...Array.from(new Set(characters.map(c => c.rarity))).sort((a, b) => b - a)];

  // Filter characters
  const filteredCharacters = characters.filter(character => {
    const matchesSearch = character.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesElement = selectedElement === 'all' || character.element === selectedElement;
    const matchesWeapon = selectedWeapon === 'all' || character.weaponType === selectedWeapon;
    const matchesRarity = selectedRarity === 'all' || character.rarity === parseInt(selectedRarity);
    return matchesSearch && matchesElement && matchesWeapon && matchesRarity;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredCharacters.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCharacters = filteredCharacters.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedElement, selectedWeapon, selectedRarity]);

  // Get element icon URL from backend
  const getElementIcon = (element: string) => {
    const elementMap: { [key: string]: string } = {
      'glacio': 'glacio.png',
      'fusion': 'fusion.png',
      'electro': 'electro.png',
      'aero': 'aero.png',
      'spectro': 'spectro.png',
      'havoc': 'havoc.png'
    };
    const filename = elementMap[element.toLowerCase()];
    return filename ? apiUrl(`elements/icon/${filename}`) : null;
  };

  return (
    <>
      <Header />
      <div className={styles.container} style={{ backgroundImage: `url(${currentBg})` }}>
        <div className={styles.contentWrapper}>
          <h1 className={styles.title}>Danh Sách Nhân Vật</h1>
          <p className={styles.subtitle}>Khám phá tất cả các nhân vật trong game</p>

          {/* Filter Section */}
          <div className={styles.filterSection}>
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="🔍 Tìm kiếm nhân vật..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Nguyên Tố:</label>
              <select
                value={selectedElement}
                onChange={(e) => setSelectedElement(e.target.value)}
                className={styles.filterSelect}
              >
                {elements.map(element => (
                  <option key={element} value={element}>
                    {element === 'all' ? 'Tất cả' : element}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Vũ Khí:</label>
              <select
                value={selectedWeapon}
                onChange={(e) => setSelectedWeapon(e.target.value)}
                className={styles.filterSelect}
              >
                {weapons.map(weapon => (
                  <option key={weapon} value={weapon}>
                    {weapon === 'all' ? 'Tất cả' : weapon}
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

          {/* Character Grid */}
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Đang tải nhân vật...</p>
            </div>
          ) : error ? (
            <div className={styles.error}>
              <p>{error}</p>
            </div>
          ) : (
            <>
              <div className={styles.characterGrid}>
                {paginatedCharacters.map(character => (
                  <div 
                    key={character.id} 
                    className={styles.characterCard}
                    onClick={() => navigate(`/characters/${character.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={styles.characterImageWrapper}>
                      <img
                        src={character.imageUrl}
                        alt={character.name}
                        className={styles.characterImage}
                      />
                      {getElementIcon(character.element) && (
                        <div className={styles.elementIcon}>
                          <img 
                            src={getElementIcon(character.element)!} 
                            alt={character.element}
                            className={styles.elementIconImg}
                          />
                        </div>
                      )}
                      {featuredCharacterIds.has(character.id) && (
                        <div className={styles.bannerBadge}>Banner</div>
                      )}
                      <div className={styles.rarity}>
                        {'★'.repeat(character.rarity)}
                      </div>
                    </div>
                    <div className={styles.characterName}>{character.name}</div>
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

          {filteredCharacters.length === 0 && !loading && (
            <div className={styles.noResults}>
              <p>Không tìm thấy nhân vật nào phù hợp</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CharacterPage;
