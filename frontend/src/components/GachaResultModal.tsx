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

  // Check if there's any 5-star item in the pull
  const hasFiveStar = items.some(item => item.rarity === 5);

  // Prevent body scroll when modal is open
  useEffect(() => {
    // Store original overflow style
    const originalOverflow = document.body.style.overflow;
    
    // Disable body scroll
    document.body.style.overflow = 'hidden';
    
    // Restore on cleanup
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Skip animation and show all results
  const handleSkip = () => {
    setShowAll(true);
  };

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
      }, 1200); // Slower reveal for more dramatic effect
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setShowAll(true);
      }, 1500); // Longer pause before showing all
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

  // Don't render if no items
  if (items.length === 0) {
    return null;
  }

  // Handle wheel scroll for horizontal scrolling
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    container.scrollLeft += e.deltaY;
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling to prevent body scroll
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
      <MDiv 
        className={styles.modalOverlay} 
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        onWheel={(e: any) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {/* 5-star golden glow effect - shows if ANY item in the pull is 5-star */}
        {hasFiveStar && (
          <>
            <MDiv 
              className={styles.fiveStarGlow}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
            <MDiv 
              className={styles.fiveStarRays}
              initial={{ opacity: 0, rotate: 0 }}
              animate={{ opacity: 1, rotate: 360 }}
              transition={{ duration: 20, ease: "linear", repeat: Infinity }}
            />
          </>
        )}

        <MDiv 
          className={styles.modalContent} 
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: 'spring',
            stiffness: 200,
            damping: 25,
            duration: 0.6
          }}
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className={styles.header}>
            <MDiv
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <h2>Convene Results</h2>
            </MDiv>
            <MDiv
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <button className={styles.closeButton} onClick={onClose}>×</button>
            </MDiv>
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
                  initial={{ 
                    opacity: 0, 
                    y: 50, 
                    scale: 0.8,
                    rotateY: 180
                  }}
                  animate={{ 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                    rotateY: 0
                  }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ 
                    delay: index * 0.08, 
                    duration: 0.6,
                    type: 'spring',
                    stiffness: 200,
                    damping: 20
                  }}
                  whileHover={{
                    scale: 1.1,
                    y: -10,
                    transition: { duration: 0.2 }
                  }}
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
          <div className={styles.buttonContainer}>
            <MDiv
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: items.length * 0.08 + 0.3, duration: 0.5 }}
            >
              <button className={styles.confirmButton} onClick={onClose}>
                Confirm
              </button>
            </MDiv>
          </div>
        </MDiv>
      </MDiv>
    );
  }

  const currentItem = items[currentIndex];

  return (
    <div 
      className={styles.modalOverlay}
      onWheel={(e) => {
        // Prevent body scroll when modal is open
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {/* 5-star golden glow effect - shows if ANY item in the pull is 5-star */}
      {hasFiveStar && (
        <>
          <MDiv 
            className={styles.fiveStarGlow}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          <MDiv 
            className={styles.fiveStarRays}
            initial={{ opacity: 0, rotate: 0 }}
            animate={{ opacity: 1, rotate: 360 }}
            transition={{ duration: 20, ease: "linear", repeat: Infinity }}
          />
        </>
      )}

      {/* Skip button */}
      <MDiv
        className={styles.skipButton}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        onClick={handleSkip}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <span>SKIP</span>
        <span className={styles.skipIcon}>⏭</span>
      </MDiv>

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

      {/* Portal vortex effect for multiple items */}
      {items.length > 1 && (
        <div className={styles.portalContainer}>
          {/* Rotating portal rings - color based on current item rarity */}
          <div className={styles.portalRings}>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={styles.portalRing}
                style={{
                  width: `${(i + 1) * 60}px`,
                  height: `${(i + 1) * 60}px`,
                  animationDelay: `${i * 0.2}s`,
                  opacity: 1 - i * 0.15,
                  borderColor: `${getRarityColor(currentItem.rarity)} transparent ${getRarityColor(currentItem.rarity)} transparent`
                }}
              />
            ))}
          </div>
          
          {/* Card stack - simple slide out effect */}
          <div className={styles.cardStack}>
            {items.map((item, index) => {
              const isActive = index === currentIndex;
              const isPast = index < currentIndex;
              const isFuture = index > currentIndex;
              const distance = index - currentIndex;
              
              return (
                <MDiv
                  key={index}
                  className={styles.stackCard}
                  initial={{ 
                    scale: 0.8,
                    z: distance * -100,
                    opacity: 0
                  }}
                  animate={{
                    scale: isPast ? 0.5 : isActive ? 1 : 0.7 - Math.abs(distance) * 0.1,
                    z: isPast ? -1000 : distance * -80,
                    opacity: isPast ? 0 : isFuture ? 0.4 : 1,
                    x: isPast ? -500 : 0,
                    y: isPast ? -200 : distance * 20
                  }}
                  transition={{
                    duration: isPast ? 0.6 : 0.4,
                    ease: isPast ? [0.6, 0.01, 0.05, 0.95] : 'easeOut'
                  }}
                  style={{
                    zIndex: items.length - index,
                    borderColor: getRarityColor(item.rarity),
                    boxShadow: isActive
                      ? `0 0 60px ${getRarityColor(item.rarity)}, 0 0 100px ${getRarityColor(item.rarity)}`
                      : `0 0 20px ${getRarityColor(item.rarity)}`,
                  }}
                />
              );
            })}
          </div>
        </div>
      )}

      <div className={styles.singleCardView}>
        {/* Warp speed effect - color based on rarity */}
        <div className={styles.warpLines}>
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className={styles.warpLine}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 150 + 100}px`,
                background: `linear-gradient(to bottom,
                  transparent 0%,
                  ${getRarityColor(currentItem.rarity)} 50%,
                  transparent 100%
                )`
              }}
            />
          ))}
        </div>
        
        <MDiv 
          ref={cardRef}
          className={`${styles.card} ${currentItem.rarity === 5 ? styles.cardFiveStar : ''}`}
          initial={{ 
            scale: 0.1, 
            rotateY: 360, 
            rotateZ: 180,
            opacity: 0, 
            z: -1000,
            filter: 'blur(20px)'
          }}
          animate={{ 
            scale: [0.1, 1.15, 0.95, 1], 
            rotateY: [360, 720, 0], 
            rotateZ: [180, -20, 0],
            opacity: [0, 1, 1, 1],
            z: [-1000, 100, -50, 0],
            filter: ['blur(20px)', 'blur(5px)', 'blur(0px)', 'blur(0px)']
          }}
          transition={{ 
            duration: 1.5,
            times: [0, 0.4, 0.7, 1],
            ease: [0.68, -0.55, 0.265, 1.55]
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
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ 
              opacity: 1, 
              scale: [0.5, 1.1, 1], 
              y: [50, -10, 0] 
            }}
            transition={{ 
              delay: 0.6,
              duration: 0.8,
              times: [0, 0.6, 1],
              ease: 'easeOut'
            }}
          >
            <img 
              src={currentItem.imageUrl} 
              alt={currentItem.name} 
              className={styles.cardImage}
            />
          </MDiv>
          
          <MDiv 
            className={styles.cardInfo}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              scale: 1
            }}
            transition={{ 
              delay: 0.9,
              duration: 0.5,
              type: 'spring',
              stiffness: 200
            }}
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
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ 
            opacity: 1,
            scale: [0.5, 1.2, 1]
          }}
          transition={{ 
            delay: 1.1,
            duration: 0.6,
            times: [0, 0.6, 1]
          }}
        >
          <MDiv
            key={currentIndex}
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {currentIndex + 1} / {items.length}
          </MDiv>
        </MDiv>
      </div>
    </div>
  );
};

export default GachaResultModal;
