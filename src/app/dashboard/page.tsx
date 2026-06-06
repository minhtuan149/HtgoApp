'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Plus, 
  Calendar, 
  ArrowUpRight, 
  Edit, 
  Trash2, 
  Loader2,
  CheckCircle,
  XCircle,
  ChevronRight,
  TrendingUpIcon
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { CategoryPieChart, IncomeExpenseBarChart, DailyTrendAreaChart } from '@/components/DashboardCharts';
import TransactionModal, { CategoryIcon } from '@/components/TransactionModal';
import styles from '@/styles/dashboard.module.css';
import compStyles from '@/styles/components.module.css';

// Currency formatter
const formatVND = (value: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
};

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  
  // Dashboard calculation states
  const [netBalance, setNetBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  
  const [pieData, setPieData] = useState<any[]>([]);
  const [barData, setBarData] = useState<any[]>([]);
  const [areaData, setAreaData] = useState<any[]>([]);
  
  const [userName, setUserName] = useState('');

  // Fetch initial datasets
  const fetchData = async () => {
    try {
      setLoading(true);
      const [transRes, catRes, userRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/categories'),
        fetch('/api/auth/me'),
      ]);

      if (transRes.ok && catRes.ok) {
        const transData = await transRes.json();
        const catData = await catRes.json();
        setTransactions(transData);
        setCategories(catData);
        
        // Calculate metrics
        calculateDashboardMetrics(transData);
      }
      
      if (userRes.ok) {
        const uData = await userRes.json();
        setUserName(uData.user.name);
      }
    } catch (err) {
      console.error('Error loading dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const calculateDashboardMetrics = (transList: any[]) => {
    let income = 0;
    let expense = 0;
    
    // 1. General summaries
    transList.forEach((t) => {
      if (t.type === 'INCOME') {
        income += t.amount;
      } else {
        expense += t.amount;
      }
    });
    
    setTotalIncome(income);
    setTotalExpense(expense);
    setNetBalance(income - expense);

    // 2. Pie chart: expense breakdown by category
    const expenseCats: { [key: string]: { value: number; color: string } } = {};
    transList
      .filter((t) => t.type === 'EXPENSE')
      .forEach((t) => {
        const catName = t.category?.name || 'Chi phí khác';
        const color = t.category?.color || '#6B7280';
        if (!expenseCats[catName]) {
          expenseCats[catName] = { value: 0, color };
        }
        expenseCats[catName].value += t.amount;
      });

    const compiledPie = Object.keys(expenseCats).map((name) => ({
      name,
      value: expenseCats[name].value,
      color: expenseCats[name].color,
    }));
    setPieData(compiledPie);

    // 3. Bar Chart: monthly comparison (last 4 months)
    const monthNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    const monthlySummary: { [key: string]: { income: number; expense: number } } = {};
    
    // Initialize last 4 months
    const now = new Date();
    for (let i = 3; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = `T${d.getMonth() + 1}/${d.getFullYear().toString().substring(2)}`;
      monthlySummary[label] = { income: 0, expense: 0 };
    }

    transList.forEach((t) => {
      const d = new Date(t.date);
      const label = `T${d.getMonth() + 1}/${d.getFullYear().toString().substring(2)}`;
      if (monthlySummary[label] !== undefined) {
        if (t.type === 'INCOME') {
          monthlySummary[label].income += t.amount;
        } else {
          monthlySummary[label].expense += t.amount;
        }
      }
    });

    const compiledBar = Object.keys(monthlySummary).map((label) => ({
      name: label,
      'Thu nhập': monthlySummary[label].income,
      'Chi tiêu': monthlySummary[label].expense,
    }));
    setBarData(compiledBar);

    // 4. Area Chart: Daily trends for the current month
    const dailyMap: { [key: string]: { income: number; expense: number } } = {};
    const currentMonthTrans = transList.filter((t) => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
    });

    // Populate every day of current month up to today
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysToGenerate = now.getDate(); // Up to today
    for (let day = 1; day <= daysToGenerate; day++) {
      const label = `${day.toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}`;
      dailyMap[label] = { income: 0, expense: 0 };
    }

    currentMonthTrans.forEach((t) => {
      const tDate = new Date(t.date);
      const label = `${tDate.getDate().toString().padStart(2, '0')}/${(tDate.getMonth() + 1).toString().padStart(2, '0')}`;
      if (dailyMap[label] !== undefined) {
        if (t.type === 'INCOME') {
          dailyMap[label].income += t.amount;
        } else {
          dailyMap[label].expense += t.amount;
        }
      }
    });

    const compiledArea = Object.keys(dailyMap).map((date) => ({
      date,
      'Thu nhập': dailyMap[date].income,
      'Chi tiêu': dailyMap[date].expense,
    }));
    setAreaData(compiledArea);
  };

  const handleCreateOrEdit = async (data: any) => {
    const isEdit = !!data.id;
    const url = isEdit ? `/api/transactions/${data.id}` : '/api/transactions';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Lỗi lưu thông tin giao dịch');
    }

    // Refresh dataset
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa giao dịch này không?')) return;

    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchData();
      } else {
        const errData = await res.json();
        alert(errData.error || 'Lỗi khi xóa giao dịch');
      }
    } catch (err) {
      console.error(err);
      alert('Không thể kết nối đến máy chủ');
    }
  };

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Chào buổi sáng';
    if (hours < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  // Recent 5 transactions
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className={styles.container}>
      <Sidebar />
      <main className={styles.main}>
        {/* Header Section */}
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>Tổng quan</h1>
            <p className={styles.greeting}>
              {getGreeting()}{userName ? `, ${userName}` : ''}! Dưới đây là tóm tắt tài chính của bạn.
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedTransaction(null);
              setModalOpen(true);
            }}
            className={`${compStyles.btn} ${compStyles.btnPrimary}`}
          >
            <Plus size={18} />
            <span>Thêm giao dịch</span>
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <Loader2 size={36} className="animate-spin-fast" style={{ color: 'var(--primary)' }} />
          </div>
        ) : (
          <>
            {/* Stats Cards Row */}
            <div className={styles.statsGrid}>
              <div className={`${styles.statCard} ${styles.statBalance}`}>
                <div className={styles.statInfo}>
                  <span className={styles.statLabel}>Số dư khả dụng</span>
                  <span className={styles.statValue} style={{ color: netBalance >= 0 ? 'var(--text-main)' : 'var(--danger)' }}>
                    {formatVND(netBalance)}
                  </span>
                </div>
                <div className={styles.statIcon}>
                  <Wallet size={24} />
                </div>
              </div>

              <div className={`${styles.statCard} ${styles.statIncome}`}>
                <div className={styles.statInfo}>
                  <span className={styles.statLabel}>Tổng thu nhập</span>
                  <span className={styles.statValue}>
                    {formatVND(totalIncome)}
                  </span>
                </div>
                <div className={styles.statIcon}>
                  <TrendingUp size={24} />
                </div>
              </div>

              <div className={`${styles.statCard} ${styles.statExpense}`}>
                <div className={styles.statInfo}>
                  <span className={styles.statLabel}>Tổng chi tiêu</span>
                  <span className={styles.statValue}>
                    {formatVND(totalExpense)}
                  </span>
                </div>
                <div className={styles.statIcon}>
                  <TrendingDown size={24} />
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className={styles.chartsGrid}>
              <div className={styles.chartCard}>
                <div className={styles.chartTitle}>
                  <span>Xu hướng thu chi trong tháng</span>
                  <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)' }}>Mỗi ngày</span>
                </div>
                <div className={styles.chartContainer}>
                  <DailyTrendAreaChart data={areaData} />
                </div>
              </div>

              <div className={styles.chartCard}>
                <div className={styles.chartTitle}>
                  <span>Phân bổ chi tiêu</span>
                  <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)' }}>Danh mục</span>
                </div>
                <div className={styles.chartContainer}>
                  <CategoryPieChart data={pieData} />
                </div>
              </div>
            </div>

            {/* Secondary Charts & Recent Transactions Row */}
            <div className={styles.chartsGrid}>
              {/* Compare Months */}
              <div className={styles.chartCard}>
                <div className={styles.chartTitle}>
                  <span>So sánh thu chi theo tháng</span>
                  <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)' }}>Gần đây</span>
                </div>
                <div className={styles.chartContainer}>
                  <IncomeExpenseBarChart data={barData} />
                </div>
              </div>

              {/* Recent Transactions List */}
              <div className={styles.chartCard} style={{ display: 'flex', flexDirection: 'column' }}>
                <div className={styles.chartTitle} style={{ marginBottom: '16px' }}>
                  <span>Giao dịch gần đây</span>
                  <Link href="/dashboard/transactions" className={styles.viewAllLink}>
                    Xem tất cả
                  </Link>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {recentTransactions.length === 0 ? (
                    <div className={styles.emptyState}>
                      <span className={styles.emptyStateTitle}>Không có giao dịch nào</span>
                      <span className={styles.emptyStateDesc}>Bấm "Thêm giao dịch" ở góc trên để bắt đầu nhập dữ liệu chi tiêu đầu tiên.</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {recentTransactions.map((t) => (
                        <div key={t.id} className={styles.recentTxItem}>
                          <div className={styles.recentTxLeft}>
                            <div 
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                width: '38px', 
                                height: '38px', 
                                borderRadius: '50%', 
                                backgroundColor: t.category?.color || 'var(--text-muted)',
                                color: '#fff',
                                flexShrink: 0
                              }}
                            >
                              <CategoryIcon name={t.category?.icon || 'HelpCircle'} size={18} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                              <span style={{ fontWeight: 600, fontSize: '14px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                {t.description}
                              </span>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                {new Date(t.date).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                          </div>

                          <div className={styles.recentTxRight}>
                            <span 
                              style={{ 
                                fontWeight: 700, 
                                fontSize: '14px', 
                                color: t.type === 'INCOME' ? 'var(--success)' : 'var(--danger)' 
                              }}
                            >
                              {t.type === 'INCOME' ? '+' : '-'}{formatVND(t.amount)}
                            </span>
                            <div className={styles.actionCell}>
                              <button
                                onClick={() => {
                                  setSelectedTransaction(t);
                                  setModalOpen(true);
                                }}
                                className={styles.iconBtn}
                                title="Sửa"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(t.id)}
                                className={`${styles.iconBtn} ${styles.iconBtnDelete}`}
                                title="Xóa"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Modal for adding/editing transaction */}
        <TransactionModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedTransaction(null);
          }}
          onSubmit={handleCreateOrEdit}
          transaction={selectedTransaction}
          categories={categories}
        />
      </main>
    </div>
  );
}
