import AdminDashboard from './components/AdminDashboard';
import LandingPage from './components/LandingPage';

export default function App() {
  const isAdminRoute = window.location.pathname.startsWith('/admin');

  return (
    <div className="bg-white font-sans text-[#171717]">
      {isAdminRoute ? <AdminDashboard /> : <LandingPage />}
    </div>
  );
}
