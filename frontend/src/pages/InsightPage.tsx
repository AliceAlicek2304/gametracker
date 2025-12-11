import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Tesseract from 'tesseract.js';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { apiFetch } from '../utils/apiHelper';
import styles from './InsightPage.module.css';
import { characterWeights } from '../data/characterWeights.ts';
import type { CharacterWeights } from '../data/characterWeights.ts';
import { scanRegions } from '../data/scanRegions.ts';
import { statRanges, combatStats } from '../data/echoStats.ts';
import { toast } from 'react-toastify';

interface EchoStat {
  label: string;
  value: number;
  displayValue: string; // Original amount string with % if applicable
  tier: number;
  percentage: number;
  icon: string;
  isCrit: boolean;
  isWeighted: boolean;
}

interface Echo {
  title: string;
  stats: EchoStat[];
  critValue: number;
  weightedValue: number;
  echoImage?: string;
  setImage?: string;
  costImage?: string;
}

interface CharacterCardData {
  name: string;
  image: string;
  stats: Array<{ label: string; value: string; icon: string }>;
}

const InsightPage: React.FC = () => {
  const [echoes, setEchoes] = useState<Echo[]>([]);
  const [characterCard, setCharacterCard] = useState<CharacterCardData | null>(null);
  const [totalCrit, setTotalCrit] = useState<number>(0);
  const [totalWeighted, setTotalWeighted] = useState<number>(0);
  const [maxCrit, setMaxCrit] = useState<number>(0);
  const [maxWeighted, setMaxWeighted] = useState<number>(0);
  const [uploading, setUploading] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [filterCrit, setFilterCrit] = useState(false);
  const [filterWeight, setFilterWeight] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const showcaseRef = useRef<HTMLDivElement>(null);

  // Background animation
  const [backgrounds, setBackgrounds] = useState<string[]>([]);
  const [currentBg, setCurrentBg] = useState('');

  useEffect(() => {
    // Fetch backgrounds
    apiFetch('background')
      .then(response => response.json())
      .then(data => {
        const bgUrls = Array.isArray(data) && data.length > 0 && typeof data[0] === 'object'
          ? data.map((item: { filename: string; url: string }) => item.url)
          : [];
        setBackgrounds(bgUrls);
        if (bgUrls.length > 0) {
          setCurrentBg(bgUrls[Math.floor(Math.random() * bgUrls.length)]);
        }
      })
      .catch(() => setBackgrounds([]));
  }, []);

  useEffect(() => {
    if (backgrounds.length === 0) return;
    const interval = setInterval(() => {
      setCurrentBg(backgrounds[Math.floor(Math.random() * backgrounds.length)]);
    }, 10000);
    return () => clearInterval(interval);
  }, [backgrounds]);

  // Helper: Get tier from stat value
  const getTier = (statLabel: string, value: number): number => {
    if (!statRanges[statLabel]) return 0;
    let tier = 0;
    for (const [key, threshold] of Object.entries(statRanges[statLabel])) {
      if (value >= threshold) {
        tier = Math.max(tier, parseInt(key));
      }
    }
    return tier;
  };

  // Helper: Get percentage (value / max * 100)
  const getPercentage = (statLabel: string, value: number): number => {
    if (!statRanges[statLabel] || !statRanges[statLabel][8]) return 0;
    return (value / statRanges[statLabel][8]) * 100;
  };

  // Helper: Get stat icon name
  const getStatIcon = (statLabel: string): string => {
    return combatStats.icon[statLabel as keyof typeof combatStats.icon] || 'none';
  };

  // Helper: Get rank from percentage (EXACT from WutheringInsight)
  const getRank = (percentage: number): string => {
    const thresholds = [
      { min: 75, rank: 'Sentinel' },
      { min: 70, rank: 'WTF+' },
      { min: 65, rank: 'WTF' },
      { min: 60.5, rank: 'SSS+' },
      { min: 56.5, rank: 'SSS' },
      { min: 53, rank: 'SS+' },
      { min: 50, rank: 'SS' },
      { min: 47.5, rank: 'S+' },
      { min: 45, rank: 'S' },
      { min: 42.5, rank: 'A+' },
      { min: 40, rank: 'A' },
      { min: 37.5, rank: 'B+' },
      { min: 35, rank: 'B' },
      { min: 32.5, rank: 'C+' },
      { min: 30, rank: 'C' },
      { min: 27.5, rank: 'D+' },
      { min: 25, rank: 'D' },
      { min: 22.5, rank: 'F+' },
    ];

    for (const { min, rank } of thresholds) {
      if (percentage >= min) return rank;
    }
    return 'F';
  };

  // Helper: Get weight cutoff (5th highest weight)
  const getWeightCutoff = (weights: Record<string, number>): number => {
    const values = Object.values(weights).sort((a, b) => b - a);
    return values[4] || 0;
  };

  // Helper: Convert canvas region to data URL
  const areaToDataUrl = (canvas: HTMLCanvasElement, region: { left: number; top: number; width: number; height: number }): string => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = region.width;
    tempCanvas.height = region.height;
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return '';
    
    ctx.drawImage(
      canvas,
      region.left, region.top, region.width, region.height,
      0, 0, region.width, region.height
    );
    
    return tempCanvas.toDataURL('image/png');
  };

  // Image preprocessing: Adjust levels for better OCR (from WutheringInsight)
  const adjustLevels = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    inputMin: number,
    inputMax: number,
    gamma: number,
    outputMin: number,
    outputMax: number
  ) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const d = imageData.data;
    const invGamma = 1 / gamma;

    for (let i = 0; i < d.length; i += 4) {
      // Convert to grayscale using luminance formula
      let gray = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];

      // Normalize input range
      gray = (gray - inputMin) / (inputMax - inputMin);
      gray = Math.min(Math.max(gray, 0), 1);

      // Gamma correction
      gray = Math.pow(gray, invGamma);

      // Scale to output range
      gray = gray * (outputMax - outputMin) + outputMin;
      gray = Math.min(Math.max(gray, 0), 255);

      // Apply to RGB channels (grayscale)
      d[i] = d[i + 1] = d[i + 2] = gray;
      // Alpha channel unchanged
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    try {
      // Load image
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await img.decode();

      // Validate dimensions
      if (img.width !== 1920 || img.height !== 1080) {
        toast.error('❌ Ảnh phải có độ phân giải 1920x1080! Vui lòng upload ảnh showcase gốc từ game.');
        setUploading(false);
        return;
      }

      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      
      ctx.drawImage(img, 0, 0);

      // Image preprocessing for better OCR (from WutheringInsight)
      // Parameters: inputMin=35, inputMax=168, gamma=1, outputMin=0, outputMax=255
      adjustLevels(ctx, img.width, img.height, 35, 168, 1, 0, 255);
      const imageDataUrl = canvas.toDataURL('image/jpeg', 7);

      // Initialize Tesseract
      const worker = await Tesseract.createWorker('eng');
      await worker.setParameters({
        tessedit_pageseg_mode: 7 as any,
        tessedit_char_whitelist: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ%,. ',
      });

      // Scan character name
      const { data: { text: nameText } } = await worker.recognize(imageDataUrl, {
        rectangle: scanRegions.name,
      });

      // Clean up character name
      let cleanedName = nameText
        .replace('luno', 'Iuno')
        .replace('Zan', 'Zani')
        .trim();

      // Fix ending 'j' -> 'i'
      const nameParts = cleanedName.split(' ');
      if (nameParts[0].endsWith('j')) {
        nameParts[0] = nameParts[0].slice(0, -1) + 'i';
        cleanedName = nameParts.join(' ');
      }

      // Match character
      let matchedChar = Object.keys(characterWeights).find(key =>
        cleanedName.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(cleanedName.toLowerCase())
      );

      if (!matchedChar) {
        toast.error(`❌ Không tìm thấy nhân vật "${cleanedName}". Vui lòng thử lại.`);
        await worker.terminate();
        setUploading(false);
        return;
      }

      // Calculate max values
      const charWeights = characterWeights[matchedChar as keyof CharacterWeights].weights;
      const maxWeightedPerEcho = Object.values(charWeights)
        .sort((a, b) => b - a)
        .slice(0, 5)
        .reduce((sum, val) => sum + val, 0) * 100;
      
      const maxCritPerEcho = 42; // Max crit value per echo (21% CR * 2 or 42% CD)
      const hasCritRate = (charWeights.CritRate ?? 0) > 0;
      const hasCritDMG = (charWeights.CritDMG ?? 0) > 0;
      const maxCritTotal = maxCritPerEcho * 5 * (hasCritRate && hasCritDMG ? 1 : 0.5);

      setMaxCrit(maxCritTotal);
      setMaxWeighted(maxWeightedPerEcho * 5);

      // Create character card
      const cardImage = `/insight-cards/${matchedChar.replace(' ', '')}.webp`;
      setCharacterCard({
        name: matchedChar,
        image: cardImage,
        stats: [], // Can add main stats here if needed
      });

      // Process echoes
      const processedEchoes: Echo[] = [];
      let critTotal = 0;
      let weightedTotal = 0;

      for (let echoIndex = 0; echoIndex < 5; echoIndex++) {
        const echoStats: EchoStat[] = [];
        let echoCritValue = 0;
        let echoWeightedValue = 0;

        // Extract echo images
        const echoImage = areaToDataUrl(canvas, scanRegions.echoRegions[echoIndex]);
        const setImage = areaToDataUrl(canvas, scanRegions.setIcons[echoIndex]);
        const costImage = areaToDataUrl(canvas, scanRegions.costIcons[echoIndex]);

        // Scan 5 stat lines
        for (let statIndex = 0; statIndex < 5; statIndex++) {
          const region = scanRegions.statRegions[echoIndex][statIndex];
          
          const { data: { text: statText } } = await worker.recognize(imageDataUrl, {
            rectangle: region,
          });

          // Cleanup (EXACT from WutheringInsight)
          const valueMatch = statText.match(/(\d+(?:\.\d+)?%?)/);
          const extractedValue = (valueMatch && valueMatch[0]) || '';
          let output = statText
            .replace('al', 'HP')
            .replace('Ronus', 'Bonus')
            .replace('Erk', 'Crit.')  // OCR error: Erk -> Crit.
            .replace('Eat', 'Crit.')  // OCR error: Eat -> Crit.
            .replace('Grit.', 'Crit.')  // OCR error: Grit. -> Crit.
            .replace('Hesonance', 'Resonance')  // OCR error: Hesonance -> Resonance
            .replace('HE', 'HP')       // OCR error: HE -> HP
            .replace('\n', '')
            .replace(/(\d+(?:\.\d+)?%?)/, '')
            .replace(/\s+/, ' ')  // IMPORTANT: NOT global!
            .trim() + ' ' + extractedValue;

          output = output
            .split(' ')
            .filter((element) => element.length > 1)
            .join(' ');

          const req = ['Crit', 'DMG', 'HP', 'DEF', 'ATK', 'Energy'];
          const found = req.some((r) => output.includes(r));
          if (statText === '' || statText.length < 4 || !found) {
            output = 'None 0';
          }

          const parts = output.split(' ');
          let amount = parts[parts.length - 1];
          parts.pop();
          let label = parts.join(' ');

          if (amount[0] === '1' && amount[1] === '7') {
            amount = '17' + amount.slice(2);
          }
          // If OCR scans "1.x" it's actually "7.x"
          if (amount[0] === '1' && amount[1] === '.') {
            amount = '7' + amount.slice(1);
          } else if (amount[0] === '7' && amount[1] === '1') {
            amount = '7.1' + amount.slice(2);
          }
          if (label !== 'Crit. DMG') {
            amount = amount.replace('17', '7');
          }
          
          // EXACT: using .includes() like source!
          if ('ATK|HP|DEF'.includes(label) && amount[amount.length - 1] === '%') {
            label += '%';
          }

          // Label formats
          let calcLabel = label.replaceAll(' ', '').replaceAll('.', '');
          
          // Fix DMG Bonus stats - need to add "Bonus" suffix for icon mapping
          // BUT exclude "Crit. DMG" which should remain as "CritDMG"
          if (label.includes('DMG') && !calcLabel.includes('Bonus') && !label.includes('Crit')) {
            calcLabel += 'Bonus';
          }
          
          const calcAmount = amount.replace('%', '');

          // Skip 'None' stats
          if (calcLabel === 'None') {
            continue;
          }

          const value = parseFloat(calcAmount);
          if (isNaN(value)) {
            continue;
          }

          // Step 8: Tier and Percentage
          const tier = getTier(calcLabel, value);
          const percentage = getPercentage(calcLabel, value);
          const icon = getStatIcon(calcLabel);

          // Step 9: Crit value (exact from source)
          const isCrit = (calcLabel === 'CritRate' && (charWeights.CritRate ?? 0) > 0) ||
                         (calcLabel === 'CritDMG' && (charWeights.CritDMG ?? 0) > 0);

          // Step 10: Weighted values
          const weight = charWeights[calcLabel as keyof typeof charWeights] || 0;
          const isWeighted = weight >= getWeightCutoff(charWeights as Record<string, number>);

          echoStats.push({
            label,
            value,
            displayValue: amount, // Store original amount with % if present
            tier,
            percentage,
            icon,
            isCrit,
            isWeighted,
          });

          // Calculate contributions
          if (calcLabel === 'CritRate' && (charWeights.CritRate ?? 0) > 0) {
            echoCritValue += value * 2;
          }
          if (calcLabel === 'CritDMG' && (charWeights.CritDMG ?? 0) > 0) {
            echoCritValue += value;
          }
          echoWeightedValue += percentage * weight;
        }

        critTotal += echoCritValue;
        weightedTotal += echoWeightedValue;

        processedEchoes.push({
          title: `Echo ${echoIndex + 1}`,
          stats: echoStats,
          critValue: echoCritValue,
          weightedValue: echoWeightedValue,
          echoImage,
          setImage,
          costImage,
        });
      }

      await worker.terminate();

      setEchoes(processedEchoes);
      setTotalCrit(critTotal);
      setTotalWeighted(weightedTotal);
      setShowControls(true);
      toast.success('✅ Phân tích hoàn tất!');
      
    } catch (error) {
      toast.error('❌ Lỗi khi xử lý ảnh. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Header />
      <div className={styles.insightPage}>
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
        }}>
          <AnimatePresence mode="popLayout">
            {currentBg && (
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
            )}
          </AnimatePresence>
        </div>
        <div className={styles.heroSection}>
          <h1 className={styles.heroTitle}>Wuthering Insight</h1>
          <p className={styles.heroSubtitle}>Echo Analyzer cho Wuthering Waves</p>
        </div>
      {!showControls && (
        <div className={styles.uploadSection}>
          <div className={styles.instructions}>
            <h3>📸 Cách lấy ảnh Showcase</h3>
            <ol>
              <li>Vào Wuthering Waves Discord server</li>
              <li>Dùng bot command: <code>/create</code></li>
              <li>Bot sẽ tạo ảnh 1920x1080 với 5 echoes tốt nhất của bạn</li>
              <li>Tải ảnh về và upload tại đây</li>
            </ol>
          </div>

          <label htmlFor="imageInput" className={styles.uploadLabel}>
            {uploading ? '⏳ Đang xử lý...' : '📤 Chọn ảnh showcase (1920x1080)'}
          </label>
        </div>
      )}

      {/* Hidden file input - always in DOM for upload button */}
      <input
        id="imageInput"
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        onChange={handleUpload}
        disabled={uploading}
        className={styles.fileInput}
        style={{ display: 'none' }}
      />

      {showControls && (
        <div className={styles.controls}>
          <button onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
              fileInputRef.current.click();
            }
          }} className={styles.btn}>
            🔄 Upload mới
          </button>
          <button
            onClick={() => setFilterCrit(!filterCrit)}
            className={`${styles.btn} ${filterCrit ? styles.active : ''}`}
          >
            ⚔️ Crit Stats
          </button>
          <button
            onClick={() => setFilterWeight(!filterWeight)}
            className={`${styles.btn} ${filterWeight ? styles.active : ''}`}
          >
            ⭐ Weighted Stats
          </button>
        </div>
      )}

      <div ref={showcaseRef} className={styles.showcase}>
        {characterCard && (
          <div className={styles.characterCard}>
            <img src={characterCard.image} alt={characterCard.name} className={styles.cardImage} />
            <h2 className={styles.characterName}>{characterCard.name}'s Echoes</h2>
          </div>
        )}

        <div className={styles.echoGrid}>
          {echoes.map((echo, index) => (
            <div key={index} className={styles.echo}>
              <div className={styles.echoTitle}>
                {echo.setImage && <img src={echo.setImage} alt="Set" className={styles.setIcon} />}
                {echo.echoImage && <img src={echo.echoImage} alt="Echo" className={styles.echoIcon} />}
                {echo.costImage && <img src={echo.costImage} alt="Cost" className={styles.costIcon} />}
              </div>

              {echo.stats.map((stat, statIndex) => (
                <div
                  key={statIndex}
                  className={`${styles.statBar} ${
                    (filterCrit && !stat.isCrit) || (filterWeight && !stat.isWeighted)
                      ? styles.dimmed
                      : ''
                  }`}
                  data-crit={stat.isCrit}
                  data-weighted={stat.isWeighted}
                >
                  <img
                    src={`/insight-icons/${stat.icon}.webp`}
                    alt={stat.label}
                    className={styles.statIcon}
                  />
                  <span className={styles.statLabel}>{stat.label}</span>
                  <span className={styles.statValue}>{stat.displayValue}</span>
                  <div className={styles.tierSegments}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(tier => (
                      <div
                        key={tier}
                        className={`${styles.tierSegment} ${tier <= stat.tier ? styles.active : ''}`}
                      />
                    ))}
                  </div>
                </div>
              ))}

              <hr className={styles.divider} />

              <div className={styles.statBar}>
                <span className={styles.statLabel}>Crit Value</span>
                <span className={styles.statValue}>
                  {echo.critValue.toFixed(1)}
                  <span className={styles.subValue}>/{maxCrit / 5}</span>
                </span>
              </div>

              <div className={styles.statBar}>
                <span className={styles.statLabel}>Weighted</span>
                <span className={styles.statValue}>
                  {((echo.weightedValue / (maxWeighted / 5)) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {showControls && (
          <div className={styles.ratings}>
            <div className={styles.ratingBox}>
              <span className={styles.ratingLabel}>Total Crit Value</span>
              <span className={styles.ratingValue}>
                {totalCrit.toFixed(1)}
                <span className={styles.subValue}> / {maxCrit.toFixed(0)}</span>
              </span>
              <span className={styles.ratingRank}>{getRank((totalCrit / maxCrit) * 100)}</span>
            </div>

            <div className={styles.ratingBox}>
              <span className={styles.ratingLabel}>Total Weighted</span>
              <span className={styles.ratingValue}>
                {((totalWeighted / maxWeighted) * 100).toFixed(1)}%
              </span>
              <span className={styles.ratingRank}>{getRank((totalWeighted / maxWeighted) * 100)}</span>
            </div>
          </div>
        )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default InsightPage;
