import { useState, useEffect } from 'react';
import StatusBanner from './components/StatusBanner';
import ServiceList from './components/ServiceList';
import IncidentTimeline from './components/IncidentTimeline';
import MaintenanceCard from './components/MaintenanceCard';
import HistorySection from './components/HistorySection';
import SubscribeForm from './components/SubscribeForm';
import ThemeToggle from './components/ThemeToggle';
import { getHeartbeat, getIncidents, getMaintenances } from './services/api';
import { useThemeStore } from './contexts/themeStore';

export default function App() {
  const theme = useThemeStore((state) => state.theme);
  const [status, setStatus] = useState('operational');
  const [services, setServices] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [maintenances, setMaintenances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [heartbeatRes, incidentsRes, maintenancesRes] = await Promise.all([
          getHeartbeat(),
          getIncidents(),
          getMaintenances()
        ]);

        setStatus(heartbeatRes.data.status);
        setServices(heartbeatRes.data.services);
        setIncidents(incidentsRes.data || []);
        setMaintenances(maintenancesRes.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#0d1117] text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className={theme === 'dark' ? 'min-h-screen bg-[#0d1117] text-white' : 'min-h-screen bg-gray-50 text-gray-900'}>
      <header className={theme === 'dark' ? 'border-b border-[#30363d] bg-[#161b22]' : 'border-b border-gray-200 bg-white'}>
        <div className="max-w-5xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Pier Cloud Status</h1>
            <p className={theme === 'dark' ? 'text-gray-400 mt-1' : 'text-gray-600 mt-1'}>Service status and incident history</p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <StatusBanner status={status} />
        <SubscribeForm />
        <MaintenanceCard maintenances={maintenances} />
        <ServiceList services={services} />
        <IncidentTimeline incidents={incidents} />
        <HistorySection incidents={incidents} />
      </main>

      <footer className={theme === 'dark' ? 'border-t border-[#30363d] mt-16' : 'border-t border-gray-200 mt-16'}>
        <div className={`max-w-5xl mx-auto px-4 py-6 text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          © 2026 Pier Cloud. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
