import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import styles from './EchoPage.module.css';
import { apiFetch } from '../utils/apiHelper';

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

type SetEcho = {
  id: number;
  name: string;
  skill: string;
  icon: string;
  isActive: boolean;
};

const EchoPage: React.FC = () => {
  const navigate = useNavigate();
  const [echoes, setEchoes] = useState<Echo[]>([]);
  const [setEchoList, setSetEchoList] = useState<SetEcho[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCost, setSelectedCost] = useState<string>('all');
  const [selectedSetEcho, setSelectedSetEcho] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 28;

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

    // Fetch echoes
    apiFetch('echoes/active')
      .then(response => response.json())
      .then(data => {
        const sortedData = data.sort((a: Echo, b: Echo) => b.id - a.id);
        setEchoes(sortedData);
        setLoading(false);
      })
      .catch(err => {
        setError('Không thể tải danh sách Echo');
        setLoading(false);
        console.error('Error fetching echoes:', err);
      });

    // Fetch set echoes
    apiFetch('set-echoes/active')
      .then(response => response.json())
      .then(data => {
        setSetEchoList(data);
      })
      .catch(err => console.error('Error fetching set echoes:', err));
  }, []);

  useEffect(() => {
    if (backgrounds.length > 0) {
      const interval = setInterval(() => {
        setCurrentBg(backgrounds[Math.floor(Math.random() * backgrounds.length)]);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [backgrounds]);

  // Get unique costs for filter
  const costs = ['all', ...Array.from(new Set(echoes.map(e => e.cost))).sort((a, b) => b - a)];

  // Filter echoes
  const filteredEchoes = echoes.filter(echo => {
    const matchesSearch = echo.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCost = selectedCost === 'all' || echo.cost === parseInt(selectedCost);
    const matchesSetEcho = selectedSetEcho === 'all' || (echo.setEchoIds && echo.setEchoIds.includes(parseInt(selectedSetEcho)));
    return matchesSearch && matchesCost && matchesSetEcho;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredEchoes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEchoes = filteredEchoes.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCost, selectedSetEcho]);

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
          <h1 className={styles.title}>Echo</h1>
          <p className={styles.subtitle}>Khám phá và theo dõi các Echo trong game</p>

          {/* Search and Filters */}
          <div className={styles.filterSection}>
            <input
              type="text"
              placeholder="Tìm kiếm Echo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Cost:</label>
              <select
                value={selectedCost}
                onChange={(e) => setSelectedCost(e.target.value)}
                className={styles.filterSelect}
              >
                {costs.map(cost => (
                  <option key={cost} value={cost}>
                    {cost === 'all' ? 'Tất cả' : `${cost} Cost`}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Set Echo:</label>
              <div className={styles.customSelect}>
                <div 
                  className={styles.selectTrigger}
                  onClick={() => {
                    const dropdown = document.getElementById('setEchoDropdown');
                    if (dropdown) {
                      dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
                    }
                  }}
                >
                  {selectedSetEcho === 'all' ? (
                    <span>Tất cả</span>
                  ) : (
                    <>
                      <img 
                        src={setEchoList.find(se => se.id === parseInt(selectedSetEcho))?.icon} 
                        alt=""
                        className={styles.selectIcon}
                      />
                      <span>{setEchoList.find(se => se.id === parseInt(selectedSetEcho))?.name}</span>
                    </>
                  )}
                  <span className={styles.selectArrow}>▼</span>
                </div>
                <div id="setEchoDropdown" className={styles.selectDropdown}>
                  <div 
                    className={styles.selectOption}
                    onClick={() => {
                      setSelectedSetEcho('all');
                      document.getElementById('setEchoDropdown')!.style.display = 'none';
                    }}
                  >
                    Tất cả
                  </div>
                  {setEchoList.map(setEcho => (
                    <div 
                      key={setEcho.id}
                      className={styles.selectOption}
                      onClick={() => {
                        setSelectedSetEcho(setEcho.id.toString());
                        document.getElementById('setEchoDropdown')!.style.display = 'none';
                      }}
                    >
                      <img 
                        src={setEcho.icon} 
                        alt={setEcho.name}
                        className={styles.selectIcon}
                      />
                      <span>{setEcho.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Loading/Error States */}
          {loading && <div className={styles.loading}>Đang tải...</div>}
          {error && <div className={styles.error}>{error}</div>}

          {/* Echo Grid */}
          {!loading && !error && (
            <>
              <div className={styles.grid}>
                {paginatedEchoes.map((echo) => (
                  <div
                    key={echo.id}
                    className={styles.card}
                    onClick={() => navigate(`/echoes/${echo.id}`)}
                  >
                    <div className={styles.imageWrapper}>
                      {echo.imageUrl ? (
                        <img
                          src={echo.imageUrl}
                          alt={echo.name}
                          className={styles.image}
                        />
                      ) : (
                        <div className={styles.placeholder}>?</div>
                      )}
                      <div className={styles.rarityBadge}>{echo.cost}</div>
                    </div>
                    <div className={styles.info}>
                      <h3 className={styles.name}>{echo.name}</h3>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={styles.pageBtn}
                  >
                    ←
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`${styles.pageBtn} ${currentPage === page ? styles.activePage : ''}`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className={styles.pageBtn}
                  >
                    →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        <Footer />
      </div>
    </>
  );
};

export default EchoPage;
