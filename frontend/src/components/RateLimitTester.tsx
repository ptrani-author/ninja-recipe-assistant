'use client';

import { useState } from 'react';

export default function RateLimitTester() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testRateLimit = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-rate-limit', {
        method: 'POST',
      });
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      setStatus({ error: 'Test failed' });
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-rate-limit');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      setStatus({ error: 'Status check failed' });
    } finally {
      setLoading(false);
    }
  };

  const resetRateLimit = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-rate-limit', {
        method: 'DELETE',
      });
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      setStatus({ error: 'Reset failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 p-4 rounded-lg border border-yellow-400/20 max-w-sm">
      <h3 className="text-yellow-400 font-bold mb-2">Rate Limit Tester</h3>
      
      <div className="space-y-2 mb-4">
        <button
          onClick={testRateLimit}
          disabled={loading}
          className="w-full px-3 py-1 bg-yellow-400 text-black rounded text-sm hover:bg-yellow-300 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Rate Limit'}
        </button>
        
        <button
          onClick={checkStatus}
          disabled={loading}
          className="w-full px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-400 disabled:opacity-50"
        >
          Check Status
        </button>
        
        <button
          onClick={resetRateLimit}
          disabled={loading}
          className="w-full px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-400 disabled:opacity-50"
        >
          Reset Limit
        </button>
      </div>

      {status && (
        <div className="text-xs text-gray-300">
          <pre className="whitespace-pre-wrap">{JSON.stringify(status, null, 2)}</pre>
        </div>
      )}
    </div>
  );
} 