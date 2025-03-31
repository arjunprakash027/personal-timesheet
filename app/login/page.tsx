'use client';

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();

    if (res.ok && data.success) {
      router.push('/');
    } else {
      setError(data.message || 'Login failed.');
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#2c0346] via-[#6a0d83] to-[#9a1c99] p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 synth-card">
        <h1 className="neon-heading text-center">Timesheet Access</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter Password"
          required
          className="input-synth"
        />
        {error && <p className="text-red-500 text-center">{error}</p>}
        <button type="submit" disabled={loading} className="btn-neon w-full">
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
