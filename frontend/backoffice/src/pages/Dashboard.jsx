import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getServices, getIncidents, getMaintenances } from '../services/api';
import { useThemeStore } from '../contexts/themeStore';

export default function Dashboard() {
  const theme = useThemeStore((state) => state.theme);
  const [stats, setStats] = useState({
    services: 0,
    incidents: 0,
    maintenances: 0,
    operational: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [servicesRes, incidentsRes, maintenancesRes] = await Promise.all([
          getServices(),
          getIncidents(),
          getMaintenances(),
        ]);

        const services = servicesRes.data || [];
        const incidents = incidentsRes.data || [];
        const maintenances = maintenancesRes.data || [];

        setStats({
          services: services.length,
          incidents: incidents.filter(i => i.status !== 'resolved').length,
          maintenances: maintenances.filter(m => m.status !== 'completed').length,
          operational: services.filter(s => s.status === 'operational').length,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <h1 className={theme === 'dark' ? 'text-2xl font-semibold text-white mb-6' : 'text-2xl font-semibold text-gray-900 mb-6'}>Dashboard</h1>
        
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className={theme === 'dark' ? 'bg-[#161b22] border border-[#30363d] overflow-hidden shadow rounded-lg' : 'bg-white overflow-hidden shadow rounded-lg'}>
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={theme === 'dark' ? 'text-3xl font-bold text-[#a78bfa]' : 'text-3xl font-bold text-indigo-600'}>{stats.services}</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className={theme === 'dark' ? 'text-sm font-medium text-gray-400 truncate' : 'text-sm font-medium text-gray-500 truncate'}>Total Services</dt>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className={theme === 'dark' ? 'bg-[#161b22] border border-[#30363d] overflow-hidden shadow rounded-lg' : 'bg-white overflow-hidden shadow rounded-lg'}>
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={theme === 'dark' ? 'text-3xl font-bold text-[#4ade80]' : 'text-3xl font-bold text-green-600'}>{stats.operational}</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className={theme === 'dark' ? 'text-sm font-medium text-gray-400 truncate' : 'text-sm font-medium text-gray-500 truncate'}>Operational</dt>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className={theme === 'dark' ? 'bg-[#161b22] border border-[#30363d] overflow-hidden shadow rounded-lg' : 'bg-white overflow-hidden shadow rounded-lg'}>
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={theme === 'dark' ? 'text-3xl font-bold text-[#f87171]' : 'text-3xl font-bold text-red-600'}>{stats.incidents}</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className={theme === 'dark' ? 'text-sm font-medium text-gray-400 truncate' : 'text-sm font-medium text-gray-500 truncate'}>Active Incidents</dt>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className={theme === 'dark' ? 'bg-[#161b22] border border-[#30363d] overflow-hidden shadow rounded-lg' : 'bg-white overflow-hidden shadow rounded-lg'}>
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={theme === 'dark' ? 'text-3xl font-bold text-[#60a5fa]' : 'text-3xl font-bold text-blue-600'}>{stats.maintenances}</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className={theme === 'dark' ? 'text-sm font-medium text-gray-400 truncate' : 'text-sm font-medium text-gray-500 truncate'}>Active Maintenances</dt>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
