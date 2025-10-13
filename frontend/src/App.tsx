import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import TrackerPage from './pages/TrackerPage';
import CharacterPage from './pages/CharacterPage';
import WeaponPage from './pages/WeaponPage';
import Dashboard from './admin/Dashboard';
import styles from './App.module.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UnauthorizedModal from './components/UnauthorizedModal';
import LoginModal from './components/auth/LoginModal';
import { useState } from 'react';

function App() {
  const [loginOpen, setLoginOpen] = useState(false);

  // listen for requests to open login modal (e.g., when 401 occurs)
  if (typeof window !== 'undefined') {
    window.addEventListener('app:open-login-modal', () => setLoginOpen(true));
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className={styles.App}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/characters" element={<CharacterPage />} />
            <Route path="/weapons" element={<WeaponPage />} />
            <Route path="/tracker" element={<TrackerPage />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />
          </Routes>
          <ToastContainer />
          <UnauthorizedModal />
          <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} onForgotPassword={() => setLoginOpen(false)} />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;