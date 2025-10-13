import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import styles from './CharacterPage.module.css';

type Character = {
  id: number;
  name: string;
  element: string;
  weaponType: string;
  imageUrl: string;
  rarity: number;
};

const CharacterPage: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedElement, setSelectedElement] = useState<string>('all');
  const [selectedWeapon, setSelectedWeapon] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');

  // Background image logic
  const [backgrounds, setBackgrounds] = useState<string[]>([]);
  const [currentBg, setCurrentBg] = useState('');

  useEffect(() => {
    // Fetch backgrounds
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

    // Fetch characters
    fetch('/api/characters/cards')
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
    return filename ? `/api/elements/icon/${filename}` : null;
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
            <div className={styles.characterGrid}>
              {filteredCharacters.map(character => (
                <div key={character.id} className={styles.characterCard}>
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
                    <div className={styles.rarity}>
                      {'★'.repeat(character.rarity)}
                    </div>
                  </div>
                  <div className={styles.characterName}>{character.name}</div>
                </div>
              ))}
            </div>
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
