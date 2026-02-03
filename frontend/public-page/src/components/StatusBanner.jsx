import { useThemeStore } from '../contexts/themeStore';

export default function StatusBanner({ status }) {
  const theme = useThemeStore((state) => state.theme);
  
  const statusConfig = {
    operational: {
      bgDark: 'bg-green-900/30',
      bgLight: 'bg-green-50',
      border: 'border-green-500',
      textDark: 'text-green-400',
      textLight: 'text-green-700',
      icon: '✓',
      message: 'All Systems Operational'
    },
    degraded: {
      bgDark: 'bg-yellow-900/30',
      bgLight: 'bg-yellow-50',
      border: 'border-yellow-500',
      textDark: 'text-yellow-400',
      textLight: 'text-yellow-700',
      icon: '!',
      message: 'Partial System Outage'
    },
    outage: {
      bgDark: 'bg-red-900/30',
      bgLight: 'bg-red-50',
      border: 'border-red-500',
      textDark: 'text-red-400',
      textLight: 'text-red-700',
      icon: '×',
      message: 'Major System Outage'
    }
  };

  const config = statusConfig[status] || statusConfig.operational;
  const bg = theme === 'dark' ? config.bgDark : config.bgLight;
  const text = theme === 'dark' ? config.textDark : config.textLight;

  return (
    <div className={`${bg} border ${config.border} rounded-lg p-6 mb-8`}>
      <div className="flex items-center gap-3">
        <span className={`${text} text-2xl font-bold`}>{config.icon}</span>
        <h2 className={`${text} text-xl font-semibold`}>{config.message}</h2>
      </div>
    </div>
  );
}
