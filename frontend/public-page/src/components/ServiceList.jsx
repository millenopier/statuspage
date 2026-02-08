export default function ServiceList({ services }) {
  const statusColors = {
    operational: 'bg-green-500',
    degraded: 'bg-yellow-500',
    outage: 'bg-red-500',
    maintenance: 'bg-blue-500'
  };

  const statusLabels = {
    operational: 'Operational',
    degraded: 'Degraded Performance',
    outage: 'Major Outage',
    maintenance: 'Under Maintenance'
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg mb-8 shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold">Services</h3>
      </div>
      <div className="grid grid-cols-2 gap-px bg-gray-200">
        {services.map((service) => (
          <div key={service.id} className="px-6 py-4 bg-white flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4 flex-1">
              <div className="font-medium">{service.name}</div>
              <div className={`w-2 h-2 rounded-full ${statusColors[service.status]}`}></div>
            </div>
            <div className="text-sm text-gray-600">{statusLabels[service.status]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
