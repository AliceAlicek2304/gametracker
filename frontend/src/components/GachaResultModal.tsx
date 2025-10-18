import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
const MDiv: any = motion.div;
import styles from './GachaResultModal.module.css';

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

interface GachaResultModalProps {
  items: GachaItem[];
  onClose: () => void;
}

const GachaResultModal: React.FC<GachaResultModalProps> = ({ items, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Trigger confetti for 5-star items
  const triggerConfetti = () => {
    const colors = ['#fbbf24', '#f59e0b', '#fcd34d', '#ffffff'];
    
    // Multiple bursts for epic effect
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 3000 };

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // Fire from multiple points
      confetti({
        ...defaults,
        particleCount,
        origin: { x: Math.random() * 0.4 + 0.3, y: Math.random() * 0.3 + 0.3 },
        colors: colors,
      });
    }, 250);
  };

  useEffect(() => {
    if (currentIndex < items.length - 1) {
      const timer = setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        setHasTriggeredConfetti(false); // Reset for next card
      }, 800);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setShowAll(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, items.length]);
  // Trigger confetti when 5-star appears
  useEffect(() => {
    const currentItem = items[currentIndex];
    if (currentItem && currentItem.rarity === 5 && !hasTriggeredConfetti && !showAll) {
      setTimeout(() => {
        triggerConfetti();
        setHasTriggeredConfetti(true);
      }, 400); // Delay to sync with card flip
    }
  }, [currentIndex, hasTriggeredConfetti, showAll, items]);

  // Handle wheel scroll for horizontal scrolling
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    container.scrollLeft += e.deltaY;
    e.preventDefault();
  };

  const getRarityColor = (rarity: number) => {
    switch (rarity) {
      case 5: return '#fbbf24'; // Gold/Yellow
      case 4: return '#a855f7'; // Purple
      case 3: return '#3b82f6'; // Blue
      default: return '#64748b';
    }
  };

  const getRarityGlow = (rarity: number) => {
    switch (rarity) {
      case 5: return '0 0 40px rgba(251, 191, 36, 0.8)';
      case 4: return '0 0 30px rgba(168, 85, 247, 0.6)';
      case 3: return '0 0 20px rgba(59, 130, 246, 0.4)';
      default: return 'none';
    }
  };

  if (showAll) {
    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div className={styles.header}>
            <h2>Convene Results</h2>
            <button className={styles.closeButton} onClick={onClose}>×</button>
          </div>
          <div 
            className={`${styles.gridView} ${items.length === 1 ? styles.gridViewSingle : ''}`} 
            onWheel={handleWheel}
          >
            <AnimatePresence>
              {items.map((item, index) => (
                <MDiv
                  key={index}
                  className={styles.gridCard}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.06, duration: 0.45 }}
                  style={{
                    borderColor: getRarityColor(item.rarity),
                    boxShadow: getRarityGlow(item.rarity)
                  }}
                >
                  {item.isFeatured && (
                    <div className={styles.featuredBadge}>FEATURED</div>
                  )}
                  {item.isNew && (
                    <div className={styles.newBadge}>NEW</div>
                  )}
                  <img src={item.imageUrl} alt={item.name} className={styles.itemImage} />
                  <div className={styles.itemInfo}>
                    <div className={styles.itemName}>{item.name}</div>
                    <div className={styles.itemRarity}>
                      {'★'.repeat(item.rarity)}
                    </div>
                  </div>
                </MDiv>
              ))}
            </AnimatePresence>
          </div>
          <button className={styles.confirmButton} onClick={onClose}>
            Confirm
          </button>
        </div>
      </div>
    );
  }

  const currentItem = items[currentIndex];

  // Get next item's rarity for deck color
  const getNextItemColor = (index: number) => {
    if (index > currentIndex) {
      const nextItem = items[index];
      return getRarityColor(nextItem.rarity);
    }
    return '#fbbf24'; // Default gold
  };

  return (
    <div className={styles.modalOverlay}>
      {/* Animated background gradient for current rarity */}
      <div 
        className={styles.bgGradient}
        style={{
          background: currentItem.rarity === 5 
            ? 'radial-gradient(circle at 50% 50%, rgba(251,191,36,0.15) 0%, transparent 70%)'
            : currentItem.rarity === 4
            ? 'radial-gradient(circle at 50% 50%, rgba(168,85,247,0.12) 0%, transparent 70%)'
            : 'radial-gradient(circle at 50% 50%, rgba(59,130,246,0.08) 0%, transparent 70%)'
        }}
      />

      {/* Light rays for 5-star */}
      {currentItem.rarity === 5 && (
        <div className={styles.lightRays}>
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className={styles.ray}
              style={{
                transform: `rotate(${i * 30}deg)`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Floating particles */}
      {!showAll && (
        <div className={styles.particles}>
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={styles.particle}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
                width: `${2 + Math.random() * 4}px`,
                height: `${2 + Math.random() * 4}px`,
                background: getRarityColor(currentItem.rarity),
              }}
            />
          ))}
        </div>
      )}

      {/* Deck of cards on the left - only show for multiple items */}
      {items.length > 1 && (
        <div className={styles.deck}>
          {items.map((item, index) => (
            <MDiv
              key={index}
              className={`${styles.deckCard} ${index <= currentIndex ? styles.deckCardDrawn : ''}`}
              initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
              animate={{
                x: index * 2,
                y: index * 2,
                rotate: index * 2,
                opacity: index <= currentIndex ? 0 : 1
              }}
              transition={{ duration: 0.4, delay: index * 0.02 }}
              style={{
                zIndex: items.length - index,
                borderColor: getNextItemColor(index),
                boxShadow: index === currentIndex + 1 ? `0 0 20px ${getNextItemColor(index)}` : '0 4px 16px rgba(0, 0, 0, 0.5)',
              }}
            />
          ))}
        </div>
      )}

      <div className={styles.singleCardView}>
        <MDiv 
          ref={cardRef}
          className={`${styles.card} ${currentItem.rarity === 5 ? styles.cardFiveStar : ''}`}
          initial={{ scale: 0.5, rotateY: 180, opacity: 0, z: -400 }}
          animate={{ 
            scale: 1, 
            rotateY: 0, 
            opacity: 1, 
            z: 0,
          }}
          transition={{ 
            type: 'spring', 
            stiffness: 200, 
            damping: 20,
            rotateY: { duration: 0.8 }
          }}
          style={{
            borderColor: getRarityColor(currentItem.rarity),
            boxShadow: getRarityGlow(currentItem.rarity)
          }}
        >
          {/* Shimmer effect overlay */}
          <div className={styles.shimmer} />
          
          {currentItem.isFeatured && (
            <MDiv 
              className={styles.featuredBadgeLarge}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.5, type: 'spring' }}
            >
              FEATURED
            </MDiv>
          )}
          {currentItem.isNew && (
            <MDiv 
              className={styles.newBadgeLarge}
              initial={{ scale: 0, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: 0.6, type: 'spring', stiffness: 400 }}
            >
              NEW!
            </MDiv>
          )}
          
          <MDiv
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <img 
              src={currentItem.imageUrl} 
              alt={currentItem.name} 
              className={styles.cardImage}
            />
          </MDiv>
          
          <MDiv 
            className={styles.cardInfo}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className={styles.cardName}>{currentItem.name}</div>
            <div 
              className={styles.cardRarity}
              style={{ color: getRarityColor(currentItem.rarity) }}
            >
              {'★'.repeat(currentItem.rarity)}
            </div>
            <div className={styles.cardType}>
              {currentItem.type === 'CHARACTER' ? 'Resonator' : 'Weapon'}
            </div>
          </MDiv>
        </MDiv>
        
        <MDiv 
          className={styles.progress}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {currentIndex + 1} / {items.length}
        </MDiv>
      </div>
    </div>
  );
};

export default GachaResultModal;
