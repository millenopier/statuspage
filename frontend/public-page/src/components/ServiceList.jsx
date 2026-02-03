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
    <div className="bg-[#161b22] border border-[#30363d] rounded-lg mb-8">
      <div className="px-6 py-4 border-b border-[#30363d]">
        <h3 className="text-lg font-semibold">Services</h3>
      </div>
      <div className="grid grid-cols-2 gap-px bg-[#30363d]">
        {services.map((service) => (
          <div key={service.id} className="px-6 py-4 bg-[#161b22] flex items-center justify-between hover:bg-[#0d1117] transition-colors">
            <div className="flex items-center gap-4 flex-1">
              <div className="font-medium">{service.name}</div>
              <div className={`w-2 h-2 rounded-full ${statusColors[service.status]}`}></div>
            </div>
            <div className="text-sm text-gray-400">{statusLabels[service.status]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
