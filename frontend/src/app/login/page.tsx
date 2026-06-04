'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/queries';
import { ApiError, clearAuthRedirectFlag } from '@/lib/api';
import { Icons } from '@/components/atoms/Icons';

export default function LoginPage() {
  const router = useRouter();
  useEffect(() => clearAuthRedirectFlag(), []);
  const [email, setEmail] = useState('demo@nodotech.io');
  const [password, setPassword] = useState('demo12345');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.login(email, password);
      router.replace('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-wrap">
      <form className="login-card" onSubmit={onSubmit}>
        <div className="login-brand">
          <div className="logo">
            <Icons.logo />
          </div>
          <div>
            <div className="brand-name">
              Nodo<b>Tech</b>
            </div>
            <div className="brand-sub">Marketing · Análisis 07</div>
          </div>
        </div>

        <p className="login-tagline">
          ROAS reconciliado contra ventas reales. La diferencia con Meta, a la vista.
        </p>

        <label className="login-field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>
        <label className="login-field">
          <span>Contraseña</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>

        {error && <div className="login-error">{error}</div>}

        <button type="submit" className="btn btn-primary login-submit" disabled={loading}>
          {loading ? 'Entrando…' : 'Iniciar sesión'}
        </button>
      </form>
    </main>
  );
}
