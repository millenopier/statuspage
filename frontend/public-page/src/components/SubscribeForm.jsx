import { useState } from 'react';
import { useThemeStore } from '../contexts/themeStore';
import axios from 'axios';

export default function SubscribeForm() {
  const theme = useThemeStore((state) => state.theme);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');

    try {
      await axios.post('http://localhost:8080/api/public/subscribe', { email });
      setStatus('success');
      setEmail('');
    } catch (error) {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={theme === 'dark' ? 'bg-[#161b22] border border-[#30363d] rounded-lg p-6 mb-8' : 'bg-white border border-gray-200 rounded-lg p-6 mb-8 shadow-sm'}>
      <h3 className="text-lg font-semibold mb-2">Subscribe to Updates</h3>
      <p className={theme === 'dark' ? 'text-sm text-gray-400 mb-4' : 'text-sm text-gray-600 mb-4'}>
        Get notified about scheduled maintenances via email
      </p>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className={theme === 'dark' 
            ? 'flex-1 px-4 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500' 
            : 'flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500'}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>

      {status === 'success' && (
        <p className="mt-3 text-sm text-green-500">✓ Successfully subscribed to maintenance notifications!</p>
      )}
      {status === 'error' && (
        <p className="mt-3 text-sm text-red-500">✗ Failed to subscribe. Please try again.</p>
      )}
    </div>
  );
}
