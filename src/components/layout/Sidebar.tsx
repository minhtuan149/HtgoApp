'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ReceiptText, HandCoins, LogOut, Loader2, Menu, X, Plus, User } from 'lucide-react';
import styles from '@/styles/dashboard.module.css';

interface UserInfo {
  name: string;
  email: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          // If auth fails, router middleware handles it, but redirect just in case
          router.push('/login');
        }
      } catch (err) {
        console.error('Failed to load user session', err);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/login');
        router.refresh();
      }
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const handleQuickAdd = () => {
    if (pathname !== '/dashboard' && pathname !== '/dashboard/transactions') {
      router.push('/dashboard?add=true');
    } else {
      window.dispatchEvent(new CustomEvent('open-add-transaction-modal'));
    }
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className={styles.mobileHeader}>
        <Link href="/dashboard" className={styles.mobileLogo}>
          <img src="/images/logo.png?v=0.01" alt="Logo" width={22} height={22} style={{ borderRadius: '6px' }} />
          <span>HTGo Money</span>
        </Link>
      </div>

      {/* Backdrop overlay (for responsive drawer, kept for fallback) */}
      {isOpen && (
        <div 
          className={styles.sidebarOverlay} 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Desktop Sidebar (hidden on mobile via CSS) */}
      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.drawerHeader}>
          <Link href="/dashboard" className={styles.logo} onClick={() => setIsOpen(false)}>
            <span className={styles.logoIcon}>
              <img src="/images/logo.png?v=0.01" alt="Logo" width={28} height={28} style={{ borderRadius: '6px' }} />
            </span>
            <span>HTGo Money</span>
          </Link>
          <button 
            className={styles.closeDrawerBtn} 
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className={styles.nav}>
          <Link
            href="/dashboard"
            className={`${styles.navItem} ${
              pathname === '/dashboard' ? styles.navActive : ''
            }`}
            onClick={() => setIsOpen(false)}
          >
            <LayoutDashboard size={20} />
            <span>Tổng quan</span>
          </Link>
          <Link
            href="/dashboard/transactions"
            className={`${styles.navItem} ${
              pathname === '/dashboard/transactions' ? styles.navActive : ''
            }`}
            onClick={() => setIsOpen(false)}
          >
            <ReceiptText size={20} />
            <span>Giao dịch</span>
          </Link>
          <Link
            href="/dashboard/debts"
            className={`${styles.navItem} ${
              pathname === '/dashboard/debts' ? styles.navActive : ''
            }`}
            onClick={() => setIsOpen(false)}
          >
            <HandCoins size={20} />
            <span>Vay & Cho vay</span>
          </Link>
        </nav>

        <div className={styles.userProfile}>
          <div className={styles.userInfo}>
            {loading ? (
              <Loader2 size={16} className="animate-spin-fast" style={{ color: 'var(--text-muted)' }} />
            ) : user ? (
              <>
                <span className={styles.userName}>{user.name}</span>
                <span className={styles.userEmail}>{user.email}</span>
              </>
            ) : (
              <span className={styles.userName}>Người dùng</span>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={styles.logoutBtn}
            title="Đăng xuất"
          >
            <LogOut size={20} />
          </button>
        </div>

        <div className={styles.versionLabel}>
          <span>Beta v0.01</span>
        </div>
      </aside>

      {/* Sticky Bottom Navigation Bar for Mobile */}
      <div className={styles.bottomNav}>
        <Link
          href="/dashboard"
          className={`${styles.bottomNavItem} ${
            pathname === '/dashboard' ? styles.bottomNavActive : ''
          }`}
        >
          <LayoutDashboard size={20} />
          <span>Tổng quan</span>
        </Link>

        <Link
          href="/dashboard/transactions"
          className={`${styles.bottomNavItem} ${
            pathname === '/dashboard/transactions' ? styles.bottomNavActive : ''
          }`}
        >
          <ReceiptText size={20} />
          <span>Giao dịch</span>
        </Link>



        <Link
          href="/dashboard/debts"
          className={`${styles.bottomNavItem} ${
            pathname === '/dashboard/debts' ? styles.bottomNavActive : ''
          }`}
        >
          <HandCoins size={20} />
          <span>Nợ nần</span>
        </Link>

        <button
          className={styles.bottomNavItem}
          onClick={() => setIsOpen(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <User size={20} />
          <span>Tài khoản</span>
        </button>
      </div>
    </>
  );
}
