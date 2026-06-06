'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Wallet, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import authStyles from '@/styles/auth.module.css';
import compStyles from '@/styles/components.module.css';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Vui lòng điền đầy đủ email và mật khẩu');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Đã xảy ra lỗi đăng nhập');
      }

      // Redirect to dashboard or previous page
      router.push(redirect);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Không thể kết nối tới máy chủ');
      setLoading(false);
    }
  };

  return (
    <div className={authStyles.authContainer}>
      <div className={authStyles.authCard}>
        <div className={authStyles.logo}>
          <span className={authStyles.logoIcon}>
            <Wallet size={32} />
          </span>
          <span>HtgoApp</span>
        </div>

        <div className={authStyles.header}>
          <h1 className={authStyles.title}>Chào mừng quay lại</h1>
          <p className={authStyles.subtitle}>
            Đăng nhập để bắt đầu quản lý thu chi cá nhân
          </p>
        </div>

        {error && (
          <div className={authStyles.errorAlert}>
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={compStyles.inputGroup}>
            <label htmlFor="email" className={compStyles.label}>
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={compStyles.input}
                style={{ paddingLeft: '48px' }}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className={compStyles.inputGroup}>
            <label htmlFor="password" className={compStyles.label}>
              Mật khẩu
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={compStyles.input}
                style={{ paddingLeft: '48px' }}
                required
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            className={`${compStyles.btn} ${compStyles.btnPrimary} ${authStyles.submitBtn}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin-fast" />
                Đang xử lý...
              </>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </form>

        <div className={authStyles.footer}>
          Chưa có tài khoản? 
          <Link href="/register" className={authStyles.footerLink}>
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className={authStyles.authContainer}>
        <div className={authStyles.authCard} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <Loader2 size={36} className="animate-spin-fast" style={{ color: 'var(--primary)' }} />
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
