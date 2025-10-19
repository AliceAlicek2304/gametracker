import React, { useState } from 'react';
import styles from './Dashboard.module.css';
import RoleManagement from './RoleManagement';
import CharacterManagement from './CharacterManagement';
import WeaponManagement from './WeaponManagement';
import SetEchoManagement from './SetEchoManagement';
import EchoManagement from './EchoManagement';
import BannerManagement from './BannerManagement';

const Dashboard: React.FC = () => {
  const [active, setActive] = useState('role');

  return (
    <div className={styles.dashboardRoot}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>Admin</div>
        <nav className={styles.menu}>
          <div
            className={`${styles.menuItem} ${active === 'role' ? styles.active : ''}`}
            onClick={() => setActive('role')}
          >
            Role Character Management
          </div>
          <div
            className={`${styles.menuItem} ${active === 'character' ? styles.active : ''}`}
            onClick={() => setActive('character')}
          >
            Character Management
          </div>
          <div
            className={`${styles.menuItem} ${active === 'weapon' ? styles.active : ''}`}
            onClick={() => setActive('weapon')}
          >
            Weapon Management
          </div>
          <div
            className={`${styles.menuItem} ${active === 'setecho' ? styles.active : ''}`}
            onClick={() => setActive('setecho')}
          >
            Set Echo Management
          </div>
          <div
            className={`${styles.menuItem} ${active === 'echo' ? styles.active : ''}`}
            onClick={() => setActive('echo')}
          >
            Echo Management
          </div>
          <div
            className={`${styles.menuItem} ${active === 'banner' ? styles.active : ''}`}
            onClick={() => setActive('banner')}
          >
            Banner Management
          </div>
          <div style={{flex:1}} />
          <div
            className={`${styles.menuItem} ${styles.homeItem}`}
            onClick={() => { window.location.href = import.meta.env.VITE_HOMEPAGE_URL || window.location.origin + '/'; }}
          >
            Home
          </div>
        </nav>
      </aside>

      <main className={styles.content}>
        <div className={styles.contentCard}>
          {active === 'role' && <RoleManagement />}
          {active === 'character' && <CharacterManagement />}
          {active === 'weapon' && <WeaponManagement />}
          {active === 'setecho' && <SetEchoManagement />}
          {active === 'echo' && <EchoManagement />}
          {active === 'banner' && <BannerManagement />}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
