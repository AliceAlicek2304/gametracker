import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (currentIndex < items.length - 1) {
      const timer = setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, 800); // Show each card for 800ms
      return () => clearTimeout(timer);
    } else {
      // After showing all cards individually, show them all together
      const timer = setTimeout(() => {
        setShowAll(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, items.length]);

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
            {items.map((item, index) => (
              <div 
                key={index} 
                className={styles.gridCard}
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
              </div>
            ))}
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
      {/* Deck of cards on the left - only show for multiple items */}
      {items.length > 1 && (
        <div className={styles.deck}>
          {items.map((item, index) => (
            <div
              key={index}
              className={`${styles.deckCard} ${index <= currentIndex ? styles.deckCardDrawn : ''}`}
              style={{
                transform: `translateX(${index * 2}px) translateY(${index * 2}px) rotate(${index * 2}deg)`,
                zIndex: items.length - index,
                opacity: index <= currentIndex ? 0 : 1,
                borderColor: getNextItemColor(index),
                boxShadow: index === currentIndex + 1 ? `0 0 20px ${getNextItemColor(index)}` : '0 4px 16px rgba(0, 0, 0, 0.5)',
              }}
            />
          ))}
        </div>
      )}

      <div className={styles.singleCardView}>
        <div 
          className={styles.card}
          style={{
            borderColor: getRarityColor(currentItem.rarity),
            boxShadow: getRarityGlow(currentItem.rarity)
          }}
        >
          {currentItem.isFeatured && (
            <div className={styles.featuredBadgeLarge}>FEATURED</div>
          )}
          {currentItem.isNew && (
            <div className={styles.newBadgeLarge}>NEW!</div>
          )}
          <img 
            src={currentItem.imageUrl} 
            alt={currentItem.name} 
            className={styles.cardImage}
          />
          <div className={styles.cardInfo}>
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
          </div>
        </div>
        <div className={styles.progress}>
          {currentIndex + 1} / {items.length}
        </div>
      </div>
    </div>
  );
};

export default GachaResultModal;
