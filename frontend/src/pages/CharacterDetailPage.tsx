import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import styles from './CharacterDetailPage.module.css';

type Role = {
  id: number;
  name: string;
  description: string;
  icon?: string;
};

type Stats = {
  id: number;
  atk: number;
  def: number;
  hp: number;
  atkUp: number;
  defUp: number;
  hpUp: number;
};

type Skill = {
  id: number;
  normalAttack: string;
  elementalSkill: string;
  elementalBurst: string;
};

type Character = {
  id: number;
  name: string;
  element: string;
  weaponType: string;
  imageUrl: string;
  rarity: number;
  description: string;
  roles: Role[];
  stats: Stats;
  skill: Skill;
};

const CharacterDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [level, setLevel] = useState(1);
  const [hoveredRole, setHoveredRole] = useState<number | null>(null);

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

    // Fetch character details
    if (id) {
      fetch(`/api/characters/${id}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Character not found');
          }
          return response.json();
        })
        .then(data => {
          setCharacter(data);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [id]);

  const calculateStat = (baseStat: number, statUp: number) => {
    return Math.round(baseStat + (level - 1) * statUp);
  };

  const getElementIcon = (element: string) => {
    // Map element names to icon URLs from backend
    const elementMap: { [key: string]: string } = {
      'PYRO': '/api/elements/icon/pyro.png',
      'HYDRO': '/api/elements/icon/hydro.png',
      'ELECTRO': '/api/elements/icon/electro.png',
      'CRYO': '/api/elements/icon/cryo.png',
      'ANEMO': '/api/elements/icon/anemo.png',
      'GEO': '/api/elements/icon/geo.png',
      'DENDRO': '/api/elements/icon/dendro.png',
      'GLACIO': '/api/elements/icon/glacio.png',
      'FUSION': '/api/elements/icon/fusion.png',
      'SPECTRO': '/api/elements/icon/spectro.png',
      'AERO': '/api/elements/icon/aero.png',
      'HAVOC': '/api/elements/icon/havoc.png',
    };
    return elementMap[element.toUpperCase()];
  };

  const getWeaponIcon = (weaponType: string) => {
    const iconMap: { [key: string]: string } = {
      'SWORD': '⚔️',
      'CLAYMORE': '🗡️',
      'POLEARM': '🔱',
      'BOW': '🏹',
      'CATALYST': '📖',
      'PISTOLS': '🔫',
      'GAUNTLETS': '🥊',
      'BROADBLADE': '⚔️',
      'RECTIFIER': '📿',
    };
    return iconMap[weaponType.toUpperCase()] || '⚔️';
  };

  const renderStars = (rarity: number) => {
    return '★'.repeat(rarity);
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <Header />
        <div className={styles.loading}>Loading...</div>
        <Footer />
      </div>
    );
  }

  if (error || !character) {
    return (
      <div className={styles.page}>
        <Header />
        <div className={styles.error}>
          <h2>Character not found</h2>
          <button onClick={() => navigate('/characters')} className={styles.backBtn}>
            Back to Characters
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
        <button onClick={() => navigate('/characters')} className={styles.backBtn}>
          ← Back to Characters
        </button>

        <div className={styles.detailCard}>
          {/* Top Row - Image and Info */}
          <div className={styles.topRow}>
            {/* Left side - Character Image */}
            <div className={styles.imageSection}>
              <img 
                src={character.imageUrl || '/placeholder-character.png'} 
                alt={character.name}
                className={styles.characterImage}
              />
            </div>

            {/* Right side - Character Info */}
            <div className={styles.infoSection}>
              {/* Header */}
              <div className={styles.header}>
                {getElementIcon(character.element) && (
                  <img 
                    src={getElementIcon(character.element)} 
                    alt={character.element}
                    className={styles.elementIconImg}
                  />
                )}
                <div className={styles.headerText}>
                  <h1 className={styles.name}>{character.name}</h1>
                  <div className={styles.stars}>{renderStars(character.rarity)}</div>
                </div>
              </div>

              {/* Description */}
              <div className={styles.description}>
                {character.description}
              </div>

              {/* Basic Info Grid */}
              <div className={styles.basicInfo}>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Nguyên tố:</div>
                  <div className={styles.infoValue}>
                    {getElementIcon(character.element) && (
                      <img 
                        src={getElementIcon(character.element)} 
                        alt={character.element}
                        className={styles.elementIconSmall}
                      />
                    )}
                    {character.element}
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Loại vũ khí:</div>
                  <div className={styles.infoValue}>
                    {character.weaponType}
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Vai trò:</div>
                  <div className={styles.rolesContainer}>
                    {character.roles && character.roles.map(role => (
                      <div 
                        key={role.id}
                        className={styles.roleIcon}
                        onMouseEnter={() => setHoveredRole(role.id)}
                        onMouseLeave={() => setHoveredRole(null)}
                      >
                        {role.icon ? (
                          <img src={role.icon} alt={role.name} />
                        ) : (
                          <span className={styles.roleText}>{role.name.charAt(0)}</span>
                        )}
                        
                        {hoveredRole === role.id && (
                          <div className={styles.roleTooltip}>
                            <div className={styles.tooltipTitle}>{role.name}</div>
                            <div className={styles.tooltipDesc}>{role.description}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row - Stats Section */}
          {character.stats && (
            <div className={styles.statsSection}>
              {/* Level Slider */}
              <div className={styles.levelControl}>
                <label className={styles.levelLabel}>
                  Level: <span className={styles.levelValue}>{level}</span>
                </label>
                <input 
                  type="range" 
                  min="1" 
                  max="90" 
                  value={level}
                  onChange={(e) => {
                    const newLevel = parseInt(e.target.value);
                    setLevel(newLevel);
                    // Update CSS variable for progress
                    const progress = ((newLevel - 1) / (90 - 1)) * 100;
                    e.target.style.setProperty('--slider-progress', `${progress}%`);
                  }}
                  className={styles.levelSlider}
                  style={{ '--slider-progress': `${((level - 1) / (90 - 1)) * 100}%` } as React.CSSProperties}
                />
                <div className={styles.levelMarks}>
                  <span>1</span>
                  <span>90</span>
                </div>
              </div>

              {/* Stats Display */}
              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <div className={styles.statLabel}>ATK</div>
                  <div className={styles.statValue}>
                    {calculateStat(character.stats.atk, character.stats.atkUp)}
                  </div>
                </div>

                <div className={styles.statItem}>
                  <div className={styles.statLabel}>DEF</div>
                  <div className={styles.statValue}>
                    {calculateStat(character.stats.def, character.stats.defUp)}
                  </div>
                </div>

                <div className={styles.statItem}>
                  <div className={styles.statLabel}>HP</div>
                  <div className={styles.statValue}>
                    {calculateStat(character.stats.hp, character.stats.hpUp)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CharacterDetailPage;
