import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getServices, getIncidents, getMaintenances } from '../services/api';

export default function Dashboard() {
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
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-3xl font-bold text-indigo-600">{stats.services}</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Services</dt>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-3xl font-bold text-green-600">{stats.operational}</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Operational</dt>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-3xl font-bold text-red-600">{stats.incidents}</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Incidents</dt>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-3xl font-bold text-blue-600">{stats.maintenances}</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Maintenances</dt>
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
