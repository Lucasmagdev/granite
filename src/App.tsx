import { useEffect, useState } from 'react';
import AdminDashboard from './components/AdminDashboard';
import IntroScreen from './components/IntroScreen';
import LandingPage from './components/LandingPage';
import { trackPageView } from './lib/analytics';

export default function App() {
  const isAdminRoute = window.location.pathname.startsWith('/admin');

  const [showIntro, setShowIntro] = useState(isAdminRoute);

  useEffect(() => {
    if (!isAdminRoute) trackPageView();
  }, []);

  function handleIntroDone() {
    setShowIntro(false);
  }

  return (
    <div className="bg-white font-sans text-[#171717]">
      {isAdminRoute ? (
        showIntro ? (
          <IntroScreen onDone={handleIntroDone} />
        ) : (
          <AdminDashboard />
        )
      ) : (
        <LandingPage />
      )}
    </div>
  );
}
