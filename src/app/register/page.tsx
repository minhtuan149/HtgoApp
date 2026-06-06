'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Wallet, Mail, Lock, User, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import authStyles from '@/styles/auth.module.css';
import compStyles from '@/styles/components.module.css';

export default function RegisterPage() {
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Vui lòng điền đầy đủ tất cả thông tin');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có độ dài tối thiểu 6 ký tự');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Đã xảy ra lỗi khi tạo tài khoản');
      }

      setSuccess('Đăng ký tài khoản thành công! Đang chuyển hướng bạn tới trang đăng nhập...');
      
      // Auto-redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Không thể kết nối đến máy chủ');
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
          <h1 className={authStyles.title}>Tạo tài khoản mới</h1>
          <p className={authStyles.subtitle}>
            Trải nghiệm quản lý chi tiêu thông minh và tiện lợi
          </p>
        </div>

        {error && (
          <div className={authStyles.errorAlert}>
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className={authStyles.successAlert}>
            <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={compStyles.inputGroup}>
            <label htmlFor="name" className={compStyles.label}>
              Họ và tên
            </label>
            <div style={{ position: 'relative' }}>
              <User
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
                id="name"
                type="text"
                placeholder="Nguyễn Văn A"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={compStyles.input}
                style={{ paddingLeft: '48px' }}
                required
                disabled={loading}
              />
            </div>
          </div>

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
                placeholder="Tối thiểu 6 ký tự"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={compStyles.input}
                style={{ paddingLeft: '48px' }}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className={compStyles.inputGroup}>
            <label htmlFor="confirmPassword" className={compStyles.label}>
              Xác nhận mật khẩu
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
                id="confirmPassword"
                type="password"
                placeholder="Xác nhận mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                Đang tạo tài khoản...
              </>
            ) : (
              'Đăng ký tài khoản'
            )}
          </button>
        </form>

        <div className={authStyles.footer}>
          Đã có tài khoản?
          <Link href="/login" className={authStyles.footerLink}>
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
