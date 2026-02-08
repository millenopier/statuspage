export default function MaintenanceCard({ maintenances }) {
  const activeMaintenances = maintenances.filter(m => m.status !== 'completed');
  
  if (!activeMaintenances || activeMaintenances.length === 0) return null;

  const formatDate = (date) => {
    return new Date(date).toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Scheduled Maintenance</h3>
      <div className="space-y-4">
        {maintenances.map((maintenance) => (
          <div key={maintenance.id} className="bg-[#161b22] border border-blue-500/50 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-blue-400">{maintenance.title}</h4>
              <span className="text-xs px-2 py-1 bg-blue-900/30 text-blue-400 rounded">
                {maintenance.status}
              </span>
            </div>
            <p className="text-sm text-gray-300 mb-3">{maintenance.description}</p>
            <div className="text-sm text-gray-400">
              <div>Start: {formatDate(maintenance.scheduled_start)}</div>
              <div>End: {formatDate(maintenance.scheduled_end)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
