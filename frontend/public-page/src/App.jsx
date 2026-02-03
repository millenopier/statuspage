import { useState, useEffect } from 'react';
import StatusBanner from './components/StatusBanner';
import ServiceList from './components/ServiceList';
import IncidentTimeline from './components/IncidentTimeline';
import MaintenanceCard from './components/MaintenanceCard';
import HistorySection from './components/HistorySection';
import { getHeartbeat, getIncidents, getMaintenances } from './services/api';

export default function App() {
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <header className="border-b border-[#30363d] bg-[#161b22]">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold">PierCloud Status</h1>
          <p className="text-gray-400 mt-1">Service status and incident history</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <StatusBanner status={status} />
        <MaintenanceCard maintenances={maintenances} />
        <ServiceList services={services} />
        <IncidentTimeline incidents={incidents} />
        <HistorySection incidents={incidents} maintenances={maintenances} />
      </main>

      <footer className="border-t border-[#30363d] mt-16">
        <div className="max-w-5xl mx-auto px-4 py-6 text-center text-gray-400 text-sm">
          © 2024 PierCloud. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
