import { useEffect } from 'react';
import AdminDashboard from './components/AdminDashboard';
import LandingPage from './components/LandingPage';
import { trackPageView } from './lib/analytics';

export default function App() {
  const isAdminRoute = window.location.pathname.startsWith('/admin');

  useEffect(() => {
    if (!isAdminRoute) trackPageView();
  }, []);

  return (
    <div className="bg-white font-sans text-[#171717]">
      {isAdminRoute ? <AdminDashboard /> : <LandingPage />}
    </div>
  );
}
