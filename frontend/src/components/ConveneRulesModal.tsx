import React from 'react';
import styles from './ConveneRulesModal.module.css';

interface ConveneRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ConveneRulesModal: React.FC<ConveneRulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Convene Rules</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        <div className={styles.modalBody}>
          <section className={styles.section}>
            <h3>Convene Rules</h3>
            <ul>
              <li>
                <strong>[From Ashes]</strong> is a <strong>[Featured Resonator Convene]</strong> event banner. 
                Details on the contents available for Convene can be found in the table below.
              </li>
              <li>
                Use <strong>[Radiant Tide]</strong> to Convene. You are guaranteed at least one 4-Star or higher 
                rarity Resonator or weapon every <span className={styles.highlight}>10 attempts</span>.
              </li>
              <li>
                The Guarantee count is shared among all <strong>[Featured Resonator Convene]</strong> event banners. 
                If a 5-Star Resonator is not obtained in this event banner, the Guarantee count is carried over to 
                other <strong>[Featured Resonator Convene]</strong> event banners and resets once a 5-Star Resonator is obtained.
              </li>
            </ul>
          </section>

          <section className={styles.section}>
            <h3>Rates</h3>
            <ul>
              <li>
                The base 5-Star Resonator drop rate is <span className={styles.rate}>0.80000%</span>. 
                The average drop rate (including the Guarantee) is <span className={styles.rate}>1.80000%</span>. 
                You are guaranteed to obtain at least one 5-Star Resonator every <span className={styles.highlight}>80</span> Convenes.
              </li>
              <li>
                Every time a 5-Star Resonator is obtained, there is a <span className={styles.rateUp}>50.00000%</span> chance 
                it will be the Featured 5-Star Resonator of this event banner, and a <span className={styles.rateUp}>50.00000%</span> chance 
                to be a random non-Featured 5-Star Resonator. All 5-Star non-Featured Resonators have equal drop rate. 
                If the 5-Star Resonator obtained is not the Featured Resonator, the next 5-Star Resonator is{' '}
                <span className={styles.guaranteed}>guaranteed</span> to be the Featured Resonator.
              </li>
              <li>
                The base 4-Star Resonator or Weapon drop rate is <span className={styles.rate}>6.00000%</span>. 
                The average drop rate (including the Guarantee) is <span className={styles.rate}>12.00000%</span>. 
                You are guaranteed to obtain at least one Resonator or Weapon of 4-Star or higher rarity every{' '}
                <span className={styles.highlight}>10</span> Convenes.
              </li>
              <li>
                Every time a 4-Star item is obtained, there is a <span className={styles.rateUp}>50.00000%</span> chance 
                it will be a Featured 4-Star Resonator of this event banner. All Featured 4-Star Resonators have equal drop rate; 
                and a <span className={styles.rateUp}>50.00000%</span> chance to be a random non-Featured 4-Star item. 
                All non-Featured 4-Star items have equal drop rate. If the 4-Star item obtained is not among the Featured Resonators, 
                the next 4-Star item is <span className={styles.guaranteed}>guaranteed</span> to be a random Featured 4-Star Resonator. 
                All Featured 4-Star Resonators have equal drop rate.
              </li>
              <li>
                The base 3-Star Weapon drop rate is 93.20000%. All 3-Star Weapons have equal drop rate.
              </li>
              <li className={styles.note}>
                ※Please refer to the Wuthering Waves Official Website for more details on the drop rates.
              </li>
            </ul>
          </section>

          <section className={styles.section}>
            <h3>Extra Rewards</h3>
            <ul>
              <li>
                On obtaining a 5-Star Resonator for the first time, you will get <span className={styles.reward}>15</span> Afterglow Corals. 
                On obtaining a 5-Star Resonator that you already own for the 2nd – 7th time, you will get{' '}
                <span className={styles.reward}>1</span> Waveband of that Resonator and <span className={styles.reward}>15</span> Afterglow Corals. 
                From the 8th time onward, you will get <span className={styles.reward}>40</span> Afterglow Corals.
              </li>
              <li>
                On obtaining a 4-Star Resonator for the first time, you will get <span className={styles.reward}>3</span> Afterglow Corals. 
                On obtaining a 4-Star Resonator that you already own for the 2nd – 7th time, you will get{' '}
                <span className={styles.reward}>1</span> Waveband of that Resonator and <span className={styles.reward}>3</span> Afterglow Corals. 
                From the 8th time onward, you will get <span className={styles.reward}>8</span> Afterglow Corals.
              </li>
              <li>
                Whenever you obtain a 4-Star Weapon, you will get <span className={styles.reward}>3</span> Afterglow Corals.
              </li>
              <li>
                Whenever you obtain a 3-Star Weapon, you will get <span className={styles.reward}>15</span> Oscillated Corals.
              </li>
              <li>
                Whenever you obtain a 5-Star Resonator that is not the Featured one, you will get an additional{' '}
                <span className={styles.reward}>30</span> Afterglow Corals.
              </li>
            </ul>
          </section>

          <section className={styles.section}>
            <h3>Notes</h3>
            <ul>
              <li>
                You may redeem <strong>up to 2</strong> limited stock Wavebands for each 5-Star Resonator with Afterglow Corals.
              </li>
              <li>
                You may redeem various items with Oscillated Corals. Please visit the in-game Store page for current options 
                and redemption limits, which reset with each version update.
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ConveneRulesModal;
