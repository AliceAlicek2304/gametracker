import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import styles from './TrackerPage.module.css';

type GachaItem = {
  cardPoolType: string;
  resourceId: number;
  qualityLevel: number;
  resourceType: string; // "Weapon" or "Resonator"
  name: string;
  count: number;
  time: string;
  imageUrl?: string; // Added by backend enrichment
  pityCount?: number; // Added by backend - pulls since last same rarity
};

type BannerData = {
  [key: string]: GachaItem[]; // Key is cardPoolType (1-9)
};

type GachaResponse = {
  success: boolean;
  message: string;
  data?: {
    code: number;
    message: string;
    data: BannerData;
  };
};

type RarityFilter = '4' | '5' | 'both';

// Banner names mapping
const BANNER_NAMES: { [key: string]: string } = {
  '1': 'Nhân Vật Giới Hạn',
  '2': 'Vũ Khí Giới Hạn',
  '3': 'Nhân Vật Tiêu Chuẩn',
  '4': 'Vũ Khí Tiêu Chuẩn',
  '5': 'Banner Tân Thủ',
  '6': 'Banner Tự Chọn Tân Thủ',
  '7': 'Banner Sự Kiện 5★ Tuỳ Chọn'
};

const TrackerPage: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gachaData, setGachaData] = useState<BannerData>({});
  const [activeTab, setActiveTab] = useState<string>('1');
  const [rarityFilter, setRarityFilter] = useState<RarityFilter>('both');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 27;

  // Background image logic (same as HomePage)
  const [backgrounds, setBackgrounds] = useState<string[]>([]);
  const [currentBg, setCurrentBg] = useState('');

  useEffect(() => {
    // Fetch list of background files
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
  }, []);

  useEffect(() => {
    if (backgrounds.length > 0) {
      const interval = setInterval(() => {
        setCurrentBg(backgrounds[Math.floor(Math.random() * backgrounds.length)]);
      }, 10000); // Change every 10 seconds

      return () => clearInterval(interval);
    }
  }, [backgrounds]);

  // Load cached gacha data on mount
  useEffect(() => {
    const cachedData = localStorage.getItem('gachaData');
    const cachedTime = localStorage.getItem('gachaDataTime');
    
    if (cachedData && cachedTime) {
      const now = Date.now();
      const expireTime = 30 * 60 * 1000; // 30 minutes in milliseconds
      
      if (now - parseInt(cachedTime) < expireTime) {
        // Data is still valid
        try {
          const parsed = JSON.parse(cachedData);
          setGachaData(parsed);
        } catch (err) {
          console.error('Error parsing cached gacha data:', err);
          localStorage.removeItem('gachaData');
          localStorage.removeItem('gachaDataTime');
        }
      } else {
        // Data expired, remove it
        localStorage.removeItem('gachaData');
        localStorage.removeItem('gachaDataTime');
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Vui lòng nhập URL');
      return;
    }
    setLoading(true);
    setError('');
    setGachaData({});

    try {
      const res = await fetch('/api/gacha/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Lỗi khi gọi API');
      }

      const json: GachaResponse = await res.json();
      if (json.success && json.data && json.data.data) {
        setGachaData(json.data.data);
        
        // Save to localStorage with timestamp
        localStorage.setItem('gachaData', JSON.stringify(json.data.data));
        localStorage.setItem('gachaDataTime', Date.now().toString());
      } else {
        setError(json.message || 'Không thể lấy dữ liệu gacha');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  // Filter items by rarity
  const getFilteredItems = (items: GachaItem[]) => {
    if (rarityFilter === 'both') {
      return items.filter(item => item.qualityLevel === 4 || item.qualityLevel === 5);
    }
    return items.filter(item => item.qualityLevel === parseInt(rarityFilter));
  };

  // Get paginated items
  const getPaginatedItems = (items: GachaItem[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  };

  // Calculate total pages
  const getTotalPages = (items: GachaItem[]) => {
    return Math.ceil(items.length / itemsPerPage);
  };

  // Reset to page 1 when changing tabs or filters
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleRarityChange = (rarity: RarityFilter) => {
    setRarityFilter(rarity);
    setCurrentPage(1);
  };

  // Get statistics for current tab
  const getStats = () => {
    if (!activeTab || !gachaData[activeTab]) return null;
    
    const allItems = gachaData[activeTab];
    const filteredItems = getFilteredItems(allItems);
    const fiveStarCount = allItems.filter(item => item.qualityLevel === 5).length;
    const fourStarCount = allItems.filter(item => item.qualityLevel === 4).length;
    
    return {
      total: allItems.length,
      fiveStar: fiveStarCount,
      fourStar: fourStarCount,
      filtered: filteredItems.length
    };
  };

  const stats = getStats();

  const powershellCommand = `iwr -UseBasicParsing -Headers @{"User-Agent"="Mozilla/5.0"} https://raw.githubusercontent.com/AliceAlicek2304/gametracker/main/backend/src/main/java/com/alice/gametracker/script/import.ps1 | iex`;

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(powershellCommand);
    alert('Đã copy lệnh PowerShell vào clipboard!');
  };

  return (
    <>
      <Header />
      <div className={styles.container} style={{ backgroundImage: `url(${currentBg})` }}>
        <div className={styles.contentWrapper}>
          <h1 className={styles.title}>Lịch Sử Triệu Hồi</h1>
          <p className={styles.subtitle}>Xem lịch sử triệu hồi và thống kê của bạn.</p>
          
          {/* PowerShell Command Section */}
          <div className={styles.instructionCard}>
            <h3 className={styles.instructionTitle}>
              <span className={styles.stepNumber}>1</span>
              Chạy lệnh PowerShell để lấy URL
            </h3>
            <p className={styles.instructionText}>
              Mở <strong>PowerShell</strong> và chạy lệnh sau để tự động lấy URL gacha từ game:
            </p>
            <div className={styles.codeBlock}>
              <code className={styles.code}>{powershellCommand}</code>
              <button 
                type="button"
                className={styles.copyBtn} 
                onClick={handleCopyCommand}
                title="Copy lệnh"
              >
                📋 Copy
              </button>
            </div>
            <p className={styles.instructionNote}>
              💡 Lệnh này sẽ tự động tìm game Wuthering Waves, đọc log file và copy URL vào clipboard.
            </p>
          </div>

          <div className={styles.instructionCard}>
            <h3 className={styles.instructionTitle}>
              <span className={styles.stepNumber}>2</span>
              Dán URL vào ô bên dưới
            </h3>
          </div>
          
          <form onSubmit={handleSubmit} className={styles.form}>
            <input
              type="text"
              className={styles.input}
              placeholder="Dán URL lịch sử gacha vào đây..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Đang tải...' : 'Tải lịch sử'}
            </button>
          </form>

          {error && <div className={styles.error}>{error}</div>}

          {Object.keys(gachaData).length > 0 && (
            <div className={styles.trackerLayout}>
              {/* Left Sidebar - Banner Selection */}
              <div className={styles.bannerSidebar}>
                <div className={styles.bannerList}>
                  {[1, 2, 3, 4, 5, 6, 7].map((poolType) => {
                    const poolKey = String(poolType);
                    const items = gachaData[poolKey] || [];
                    const fiveStar = items.filter(i => i.qualityLevel === 5).length;
                    const fourStar = items.filter(i => i.qualityLevel === 4).length;
                    
                    return (
                      <button
                        key={poolType}
                        className={`${styles.bannerCard} ${activeTab === poolKey ? styles.activeBanner : ''}`}
                        onClick={() => handleTabChange(poolKey)}
                      >
                        <div className={styles.bannerHeader}>
                          <span className={styles.bannerNumber}>Banner {poolType}</span>
                        </div>
                        <div className={styles.bannerTitle}>{BANNER_NAMES[poolKey]}</div>
                        <div className={styles.bannerStats}>
                          <div className={styles.bannerStat}>
                            <span className={styles.statCount5}>{fiveStar}</span>
                            <span className={styles.statLabel}>Sổ Pity 5★</span>
                          </div>
                          <div className={styles.bannerStat}>
                            <span className={styles.statCount4}>{fourStar}</span>
                            <span className={styles.statLabel}>Sổ Pity 4★</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Content - Statistics & Items */}
              <div className={styles.mainContent}>
                {activeTab && gachaData[activeTab] && (
                  <>
                    {/* Top Stats Cards */}
                    <div className={styles.statsRow}>
                      {/* Left Card - Banner Info */}
                      <div className={styles.statsCardLeft}>
                        <h3 className={styles.cardTitle}>{BANNER_NAMES[activeTab]}</h3>
                        <div className={styles.statsGrid}>
                          <div className={styles.statRow}>
                            <span className={styles.statLabel}>Tổng Lượt triệu hồi</span>
                            <span className={styles.statValue}>{stats?.total.toLocaleString()}</span>
                          </div>
                          <div className={styles.statRow}>
                            <span className={styles.statLabel}>Tổng số Tinh thạch</span>
                            <span className={styles.statValue}>{((stats?.total || 0) * 160).toLocaleString()}</span>
                          </div>
                          <div className={styles.statRow}>
                            <span className={styles.statLabel5}>Lượt Triệu hồi 5★</span>
                            <span className={styles.statValue5}>{stats?.fiveStar}</span>
                          </div>
                          <div className={styles.statRow}>
                            <span className={styles.statLabel4}>Lượt Triệu hồi 4★</span>
                            <span className={styles.statValue4}>{stats?.fourStar}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Card - Probability (placeholder) */}
                      <div className={styles.statsCardRight}>
                        <h3 className={styles.cardTitle}>Tỉ lệ may mắn nhận được 5★</h3>
                        <div className={styles.probabilityPlaceholder}>
                          <p>Tính năng đang được phát triển...</p>
                        </div>
                      </div>
                    </div>

                    {/* Filter Section */}
                    <div className={styles.filterSection}>
                      <h2 className={styles.sectionTitle}>Lượt Triệu hồi gần đây</h2>
                      <div className={styles.rarityFilter}>
                        <button
                          className={`${styles.rarityBtn} ${rarityFilter === '4' ? styles.activeRarity : ''}`}
                          onClick={() => handleRarityChange('4')}
                        >
                          4 ★
                        </button>
                        <button
                          className={`${styles.rarityBtn} ${rarityFilter === '5' ? styles.activeRarity : ''}`}
                          onClick={() => handleRarityChange('5')}
                        >
                          5 ★
                        </button>
                      </div>
                    </div>

                    {/* Items Grid */}
                    <div className={styles.itemsGrid}>
                      {getPaginatedItems(getFilteredItems(gachaData[activeTab])).map((item, idx) => (
                        <div 
                          key={idx} 
                          className={`${styles.itemCard} ${item.qualityLevel === 5 ? styles.fiveStarCard : styles.fourStarCard}`}
                        >
                          <div className={styles.itemImageWrapper}>
                            {item.imageUrl ? (
                              <img 
                                src={item.imageUrl} 
                                alt={item.name} 
                                className={styles.itemImage}
                              />
                            ) : (
                              <div className={styles.placeholder}>?</div>
                            )}
                            {item.pityCount && item.pityCount > 0 && (
                              <div
                                className={
                                  [
                                    styles.pityBadge,
                                    item.qualityLevel === 5 ? styles.pityBadge5 : styles.pityBadge4,
                                    item.pityCount < 40
                                      ? styles.pityGreen
                                      : item.pityCount <= 60
                                      ? styles.pityYellow
                                      : styles.pityRed
                                  ].join(' ')
                                }
                              >
                                {item.pityCount}
                              </div>
                            )}
                          </div>
                          <div className={styles.itemName}>{item.name}</div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {(() => {
                      const filteredItems = getFilteredItems(gachaData[activeTab]);
                      const totalPages = getTotalPages(filteredItems);
                      
                      if (totalPages <= 1) return null;
                      
                      return (
                        <div className={styles.pagination}>
                          <button
                            className={styles.pageBtn}
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                          >
                            ‹
                          </button>
                          
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                            <button
                              key={pageNum}
                              className={`${styles.pageBtn} ${currentPage === pageNum ? styles.activePage : ''}`}
                              onClick={() => setCurrentPage(pageNum)}
                            >
                              {pageNum}
                            </button>
                          ))}
                          
                          <button
                            className={styles.pageBtn}
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                          >
                            ›
                          </button>
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TrackerPage;
