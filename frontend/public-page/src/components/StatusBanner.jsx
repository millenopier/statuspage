export default function StatusBanner({ status }) {
  const statusConfig = {
    operational: {
      bg: 'bg-green-50',
      border: 'border-green-500',
      text: 'text-green-700',
      icon: '✓',
      message: 'All Systems Operational'
    },
    degraded: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-500',
      text: 'text-yellow-700',
      icon: '!',
      message: 'Partial System Outage'
    },
    outage: {
      bg: 'bg-red-50',
      border: 'border-red-500',
      text: 'text-red-700',
      icon: '×',
      message: 'Major System Outage'
    }
  };

  const config = statusConfig[status] || statusConfig.operational;

  return (
    <div className={`${config.bg} border ${config.border} rounded-lg p-6 mb-8`}>
      <div className="flex items-center gap-3">
        <span className={`${config.text} text-2xl font-bold`}>{config.icon}</span>
        <h2 className={`${config.text} text-xl font-semibold`}>{config.message}</h2>
      </div>
    </div>
  );
}
