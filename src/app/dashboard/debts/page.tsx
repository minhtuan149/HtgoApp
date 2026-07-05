'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  X,
  Calendar,
  RefreshCw,
  FolderOpen,
  HandCoins,
  Phone,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  Info,
  CheckCircle2,
  AlertTriangle,
  User,
  Coins
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid
} from 'recharts';
import Sidebar from '@/components/Sidebar';
import Loading from '@/components/Loading';
import PullToRefresh from '@/components/PullToRefresh';
import styles from '@/styles/dashboard.module.css';
import compStyles from '@/styles/components.module.css';

// Currency formatter helper
const formatVND = (value: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
};

// Client mounting protector for Recharts
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        Đang khởi tạo biểu đồ...
      </div>
    );
  }
  return <>{children}</>;
}

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'var(--bg-popover)',
        border: '1px solid var(--border-color)',
        padding: '10px 14px',
        borderRadius: 'var(--radius-sm)',
        boxShadow: 'var(--shadow-md)',
        fontSize: '13px',
        color: 'var(--text-main)'
      }}>
        <p style={{ fontWeight: 700, marginBottom: '4px' }}>{payload[0].payload.name}</p>
        <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: payload[0].fill }}></span>
          <span>Dư nợ còn lại:</span>
          <span style={{ fontWeight: 600 }}>{formatVND(payload[0].value)}</span>
        </p>
      </div>
    );
  }
  return null;
};

// Helper to calculate accrued interest dynamically in frontend (discrete calendar periods)
const calculateAccruedInterest = (debt: any) => {
  if (debt.status === 'PAID' || debt.interestType === 'NONE' || !debt.interestValue || debt.interestValue <= 0) {
    return 0;
  }
  const start = new Date(debt.date);
  const end = new Date();

  if (debt.interestType === 'PERCENT_MONTHLY' || debt.interestType === 'FIXED_MONTHLY') {
    let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    // If today's day of the month is less than the start day, the current month period is not fully completed yet
    if (end.getDate() < start.getDate()) {
      months--;
    }
    const elapsed = Math.max(0, months);
    if (debt.interestType === 'PERCENT_MONTHLY') {
      return debt.remaining * (debt.interestValue / 100) * elapsed;
    } else {
      return debt.interestValue * elapsed;
    }
  }

  if (debt.interestType === 'PERCENT_YEARLY' || debt.interestType === 'FIXED_YEARLY') {
    let years = end.getFullYear() - start.getFullYear();
    // Verify if we have fully crossed the anniversary month and day of the month
    const hasPassedAnniversary = 
      end.getMonth() > start.getMonth() || 
      (end.getMonth() === start.getMonth() && end.getDate() >= start.getDate());
    if (!hasPassedAnniversary) {
      years--;
    }
    const elapsed = Math.max(0, years);
    if (debt.interestType === 'PERCENT_YEARLY') {
      return debt.remaining * (debt.interestValue / 100) * elapsed;
    } else {
      return debt.interestValue * elapsed;
    }
  }

  return 0;
};

export default function DebtsDashboard() {
  const [debts, setDebts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'LENT' | 'BORROWED'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'OPEN' | 'PAID'>('ALL');

  // Modals visibility state
  const [debtModalOpen, setDebtModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  // Selection states
  const [activeDebt, setActiveDebt] = useState<any>(null);

  // Forms states
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Debt Form
  const [debtForm, setDebtForm] = useState({
    id: '',
    partnerName: '',
    partnerPhone: '',
    amount: '',
    type: 'LENT' as 'LENT' | 'BORROWED',
    date: '',
    dueDate: '',
    description: '',
    syncToTransactions: true,
    interestType: 'NONE' as 'NONE' | 'PERCENT_MONTHLY' | 'PERCENT_YEARLY' | 'FIXED_MONTHLY' | 'FIXED_YEARLY',
    interestValue: '',
  });

  // Payment Form
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    date: '',
    description: '',
    syncToTransactions: true,
  });

  const fetchDebts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterType !== 'ALL') params.append('type', filterType);
      if (filterStatus !== 'ALL') params.append('status', filterStatus);
      if (search.trim() !== '') params.append('search', search.trim());

      const res = await fetch(`/api/debts?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setDebts(data);
      }
    } catch (err) {
      console.error('Failed to load debts list', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebts();
  }, [filterType, filterStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDebts();
  };

  const handleClearFilters = () => {
    setSearch('');
    setFilterType('ALL');
    setFilterStatus('ALL');
  };

  // Metrics Calculation
  const metrics = useMemo(() => {
    let totalLent = 0; // People owe me (remaining + interest)
    let totalBorrowed = 0; // I owe people (remaining + interest)
    let totalPaid = 0;
    let totalPrincipal = 0;

    debts.forEach((debt) => {
      totalPrincipal += debt.amount;
      const paid = debt.amount - debt.remaining;
      totalPaid += paid;

      if (debt.status === 'OPEN') {
        const interest = calculateAccruedInterest(debt);
        const totalOwed = debt.remaining + interest;

        if (debt.type === 'LENT') {
          totalLent += totalOwed;
        } else {
          totalBorrowed += totalOwed;
        }
      }
    });

    const netBalance = totalLent - totalBorrowed;
    const completionRate = totalPrincipal > 0 ? (totalPaid / totalPrincipal) * 100 : 0;

    return {
      totalLent,
      totalBorrowed,
      netBalance,
      completionRate,
      totalPrincipal,
      totalPaid
    };
  }, [debts]);

  // Chart Data: Top 5 Debtors (LENT remaining + interest) and Top 5 Creditors (BORROWED remaining + interest)
  const chartData = useMemo(() => {
    // Group by partnerName and type, sum remaining + interest
    const partnerMap: { [key: string]: { name: string; type: string; value: number } } = {};
    debts
      .filter((d) => d.status === 'OPEN')
      .forEach((d) => {
        const key = `${d.partnerName}_${d.type}`;
        if (!partnerMap[key]) {
          partnerMap[key] = {
            name: d.partnerName,
            type: d.type,
            value: 0
          };
        }
        const interest = calculateAccruedInterest(d);
        partnerMap[key].value += d.remaining + interest;
      });

    const list = Object.values(partnerMap);
    const lentList = list
      .filter((item) => item.type === 'LENT')
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    const borrowedList = list
      .filter((item) => item.type === 'BORROWED')
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return {
      lentData: lentList,
      borrowedData: borrowedList,
    };
  }, [debts]);

  // Debt Create / Edit Submission
  const handleDebtSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!debtForm.partnerName.trim()) {
      setFormError('Vui lòng nhập tên người giao dịch');
      return;
    }

    const numAmount = parseFloat(debtForm.amount.replace(/\./g, ''));
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError('Vui lòng nhập số tiền hợp lệ lớn hơn 0');
      return;
    }

    setFormLoading(true);
    try {
      const isEdit = !!debtForm.id;
      const url = isEdit ? `/api/debts/${debtForm.id}` : '/api/debts';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerName: debtForm.partnerName,
          partnerPhone: debtForm.partnerPhone,
          amount: numAmount,
          type: debtForm.type,
          date: debtForm.date ? new Date(debtForm.date).toISOString() : new Date().toISOString(),
          dueDate: debtForm.dueDate ? new Date(debtForm.dueDate).toISOString() : null,
          description: debtForm.description,
          interestType: debtForm.interestType,
          interestValue: debtForm.interestType === 'NONE' ? 0 : parseFloat(debtForm.interestType.startsWith('FIXED') ? debtForm.interestValue.replace(/\./g, '') : debtForm.interestValue || '0'),
          syncToTransactions: isEdit ? false : debtForm.syncToTransactions, // Sync only on creation
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Lỗi khi lưu khoản nợ');
      }

      setDebtModalOpen(false);
      fetchDebts();
    } catch (err: any) {
      setFormError(err.message || 'Lỗi khi lưu khoản nợ');
    } finally {
      setFormLoading(false);
    }
  };

  // Delete Debt
  const handleDeleteDebt = async (id: string) => {
    if (!confirm('Bạn có thực sự muốn xóa khoản nợ này? Hành động này sẽ xóa toàn bộ lịch sử thanh toán và các giao dịch đã đồng bộ liên quan.')) return;
    try {
      const res = await fetch(`/api/debts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchDebts();
      } else {
        const errData = await res.json();
        alert(errData.error || 'Lỗi khi xóa khoản nợ');
      }
    } catch (err) {
      console.error(err);
      alert('Không thể kết nối đến máy chủ');
    }
  };

  // Payment Submission
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!activeDebt) return;

    const numAmount = parseFloat(paymentForm.amount.replace(/\./g, ''));
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError('Vui lòng nhập số tiền thanh toán lớn hơn 0');
      return;
    }

    const interest = calculateAccruedInterest(activeDebt);
    const totalOwed = activeDebt.remaining + interest;

    if (numAmount > totalOwed + 10) {
      setFormError(`Số tiền thanh toán vượt quá tổng số nợ hiện tại (${Math.round(totalOwed).toLocaleString()}đ)`);
      return;
    }

    setFormLoading(true);
    try {
      const res = await fetch(`/api/debts/${activeDebt.id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: numAmount,
          date: paymentForm.date ? new Date(paymentForm.date).toISOString() : new Date().toISOString(),
          description: paymentForm.description,
          syncToTransactions: paymentForm.syncToTransactions,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Lỗi khi ghi nhận thanh toán');
      }

      setPaymentModalOpen(false);
      fetchDebts();
    } catch (err: any) {
      setFormError(err.message || 'Lỗi khi ghi nhận thanh toán');
    } finally {
      setFormLoading(false);
    }
  };

  // Delete Payment
  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đợt thanh toán này? Số tiền nợ còn lại sẽ được khôi phục.')) return;
    try {
      const res = await fetch(`/api/debts/payments/${paymentId}`, { method: 'DELETE' });
      if (res.ok) {
        // Refresh debts list and update active debt to reflect in history modal
        const updateRes = await fetch(`/api/debts`);
        if (updateRes.ok) {
          const freshDebts = await updateRes.json();
          setDebts(freshDebts);
          const freshActiveDebt = freshDebts.find((d: any) => d.id === activeDebt.id);
          if (freshActiveDebt) {
            setActiveDebt(freshActiveDebt);
            if (freshActiveDebt.payments.length === 0) {
              setHistoryModalOpen(false);
            }
          }
        }
      } else {
        const errData = await res.json();
        alert(errData.error || 'Lỗi khi xóa đợt thanh toán');
      }
    } catch (err) {
      console.error(err);
      alert('Không thể kết nối đến máy chủ');
    }
  };

  const openAddDebtModal = () => {
    setDebtForm({
      id: '',
      partnerName: '',
      partnerPhone: '',
      amount: '',
      type: 'LENT',
      date: new Date().toISOString().split('T')[0],
      dueDate: '',
      description: '',
      syncToTransactions: true,
      interestType: 'NONE',
      interestValue: '',
    });
    setFormError('');
    setDebtModalOpen(true);
  };

  const openEditDebtModal = (debt: any) => {
    setDebtForm({
      id: debt.id,
      partnerName: debt.partnerName,
      partnerPhone: debt.partnerPhone || '',
      amount: Math.round(debt.amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
      type: debt.type as 'LENT' | 'BORROWED',
      date: new Date(debt.date).toISOString().split('T')[0],
      dueDate: debt.dueDate ? new Date(debt.dueDate).toISOString().split('T')[0] : '',
      description: debt.description || '',
      interestType: debt.interestType || 'NONE',
      interestValue: debt.interestValue ? (debt.interestType.startsWith('FIXED') ? Math.round(debt.interestValue).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : debt.interestValue.toString()) : '',
      syncToTransactions: false, // Disallowed for edits to prevent duplicate transaction entries
    });
    setFormError('');
    setDebtModalOpen(true);
  };

  const openPaymentModal = (debt: any) => {
    setActiveDebt(debt);
    const interest = calculateAccruedInterest(debt);
    const totalOwed = debt.remaining + interest;

    setPaymentForm({
      amount: Math.round(totalOwed).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
      date: new Date().toISOString().split('T')[0],
      description: '',
      syncToTransactions: true,
    });
    setFormError('');
    setPaymentModalOpen(true);
  };

  const openHistoryModal = (debt: any) => {
    setActiveDebt(debt);
    setHistoryModalOpen(true);
  };

  return (
    <div className={styles.container}>
      <Sidebar />

      <main className={styles.main}>
        <PullToRefresh onRefresh={fetchDebts}>
          {/* Header Section */}
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>Quản lý Vay & Cho vay</h1>
            <p className={styles.greeting}>Ghi lại, theo dõi các khoản đi vay từ người khác và các khoản cho vay đối tác.</p>
          </div>
          <button
            onClick={openAddDebtModal}
            className={`${compStyles.btn} ${compStyles.btnPrimary}`}
          >
            <Plus size={18} />
            <span>Thêm khoản nợ</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          {/* Lent Card */}
          <div className={`${styles.statCard} ${styles.statIncome}`} style={{ borderLeft: '4px solid var(--success)' }}>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Họ nợ tôi (Tổng cho vay)</span>
              <span className={styles.statValue} style={{ color: 'var(--success)' }}>
                {formatVND(metrics.totalLent)}
              </span>
            </div>
            <div className={styles.statIcon} style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)' }}>
              <ArrowUpRight size={24} />
            </div>
          </div>

          {/* Borrowed Card */}
          <div className={`${styles.statCard} ${styles.statExpense}`} style={{ borderLeft: '4px solid var(--danger)' }}>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Tôi nợ họ (Tổng đi vay)</span>
              <span className={styles.statValue} style={{ color: 'var(--danger)' }}>
                {formatVND(metrics.totalBorrowed)}
              </span>
            </div>
            <div className={styles.statIcon} style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)' }}>
              <ArrowDownLeft size={24} />
            </div>
          </div>

          {/* Net Debt Card */}
          <div className={`${styles.statCard} ${styles.statBalance}`} style={{
            borderLeft: metrics.netBalance >= 0 ? '4px solid var(--primary)' : '4px solid var(--warning)'
          }}>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Hiệu số nợ ròng</span>
              <span className={styles.statValue} style={{
                color: metrics.netBalance >= 0 ? 'var(--primary)' : 'var(--warning)'
              }}>
                {formatVND(metrics.netBalance)}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {metrics.netBalance >= 0 ? '💼 Người khác nợ bạn nhiều hơn' : '💸 Bạn đang nợ nhiều hơn'}
              </span>
            </div>
            <div className={styles.statIcon} style={{
              backgroundColor: metrics.netBalance >= 0 ? 'var(--primary-light)' : 'hsl(38, 92%, 96%)',
              color: metrics.netBalance >= 0 ? 'var(--primary)' : 'var(--warning)'
            }}>
              <Coins size={24} />
            </div>
          </div>
        </div>

        {/* Charts Row */}
        {debts.some((d) => d.status === 'OPEN') && (
          <div className={styles.chartsGrid} style={{ marginBottom: '24px' }}>
            {/* Top Debtors (LENT) */}
            <div className={styles.chartCard}>
              <div className={styles.chartTitle}>
                <span>Đối tác nợ nhiều nhất (Cho vay)</span>
                <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)' }}>Top 5</span>
              </div>
              <div className={styles.chartContainer} style={{ minHeight: '200px', padding: '10px 0', minWidth: 0 }}>
                {chartData.lentData.length === 0 ? (
                  <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                    Chưa có khoản cho vay chưa thanh toán nào
                  </div>
                ) : (
                  <ClientOnly>
                    <ResponsiveContainer width="100%" height={180} minWidth={0}>
                      <BarChart
                        layout="vertical"
                        data={chartData.lentData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
                        <XAxis type="number" stroke="var(--text-muted)" fontSize={11} tickFormatter={(v) => `${v / 1000000}M`} />
                        <YAxis dataKey="name" type="category" stroke="var(--text-main)" fontSize={12} tickLine={false} width={80} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" fill="var(--success)" radius={[0, 4, 4, 0]} maxBarSize={20}>
                          {chartData.lentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill="var(--success)" opacity={1 - index * 0.15} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ClientOnly>
                )}
              </div>
            </div>

            {/* Top Creditors (BORROWED) */}
            <div className={styles.chartCard}>
              <div className={styles.chartTitle}>
                <span>Chủ nợ lớn nhất (Đi vay)</span>
                <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)' }}>Top 5</span>
              </div>
              <div className={styles.chartContainer} style={{ minHeight: '200px', padding: '10px 0', minWidth: 0 }}>
                {chartData.borrowedData.length === 0 ? (
                  <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                    Chưa có khoản đi vay chưa thanh toán nào
                  </div>
                ) : (
                  <ClientOnly>
                    <ResponsiveContainer width="100%" height={180} minWidth={0}>
                      <BarChart
                        layout="vertical"
                        data={chartData.borrowedData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
                        <XAxis type="number" stroke="var(--text-muted)" fontSize={11} tickFormatter={(v) => `${v / 1000000}M`} />
                        <YAxis dataKey="name" type="category" stroke="var(--text-main)" fontSize={12} tickLine={false} width={80} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" fill="var(--danger)" radius={[0, 4, 4, 0]} maxBarSize={20}>
                          {chartData.borrowedData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill="var(--danger)" opacity={1 - index * 0.15} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ClientOnly>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Filters Panel */}
        <div className={styles.filtersPanel}>
          {/* Text Search */}
          <form onSubmit={handleSearchSubmit} className={styles.filterGroup} style={{ minWidth: '240px', flex: '2' }}>
            <span className={styles.filterLabel}>Tìm kiếm</span>
            <div style={{ position: 'relative', display: 'flex' }}>
              <input
                type="text"
                placeholder="Tìm tên đối tác, lý do vay..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={compStyles.input}
                style={{ paddingRight: '40px' }}
              />
              <button
                type="submit"
                className={styles.iconBtn}
                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)' }}
              >
                <Search size={18} />
              </button>
            </div>
          </form>

          {/* Type Filter */}
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Phân loại</span>
            <select
              value={filterType}
              onChange={(e: any) => setFilterType(e.target.value)}
              className={`${compStyles.input} ${compStyles.select}`}
            >
              <option value="ALL">Tất cả nợ</option>
              <option value="LENT">Cho vay (Người ta nợ tôi)</option>
              <option value="BORROWED">Đi vay (Tôi nợ người ta)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Trạng thái</span>
            <select
              value={filterStatus}
              onChange={(e: any) => setFilterStatus(e.target.value)}
              className={`${compStyles.input} ${compStyles.select}`}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="OPEN">Chưa trả hết (Còn nợ)</option>
              <option value="PAID">Đã thanh toán xong</option>
            </select>
          </div>

          {/* Clear Filter Button */}
          <button
            onClick={handleClearFilters}
            className={`${compStyles.btn} ${compStyles.btnSecondary}`}
            style={{ height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Xóa bộ lọc"
          >
            <RefreshCw size={16} />
            <span>Xóa lọc</span>
          </button>
        </div>

        {/* Debts Content Area */}
        {loading ? (
          <Loading size="lg" minHeight="300px" />
        ) : debts.length === 0 ? (
          <div className={styles.tableCard} style={{ padding: '60px 20px' }}>
            <div className={styles.emptyState}>
              <FolderOpen size={48} className={styles.emptyStateIcon} />
              <span className={styles.emptyStateTitle}>Không tìm thấy khoản nợ nào</span>
              <span className={styles.emptyStateDesc}>Thử điều chỉnh lại bộ lọc hoặc bấm nút "Thêm khoản nợ" phía trên.</span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
            {debts.map((debt) => {
              const totalRepaid = debt.amount - debt.remaining;
              const repaidPercent = Math.round((totalRepaid / debt.amount) * 100) || 0;
              const isOverdue = debt.status === 'OPEN' && debt.dueDate && new Date(debt.dueDate) < new Date();
              const dateStr = new Date(debt.date).toLocaleDateString('vi-VN');
              const dueDateStr = debt.dueDate ? new Date(debt.dueDate).toLocaleDateString('vi-VN') : null;

              return (
                <div
                  key={debt.id}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '20px',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '16px',
                    animation: 'fadeIn 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Overdue Top Ribbon */}
                  {isOverdue && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      backgroundColor: 'var(--danger)'
                    }} />
                  )}

                  {/* Top Header Card */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: debt.type === 'LENT' ? 'var(--success-light)' : 'var(--danger-light)',
                          color: debt.type === 'LENT' ? 'var(--success)' : 'var(--danger)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <User size={18} />
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {debt.partnerName}
                          </h3>
                          {debt.partnerPhone && (
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Phone size={10} />
                              {debt.partnerPhone}
                            </span>
                          )}
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            color: debt.interestType === 'NONE' ? 'var(--text-muted)' : 'var(--warning)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginTop: '2px'
                          }}>
                            💰 {(() => {
                              if (debt.interestType === 'NONE' || !debt.interestValue || debt.interestValue <= 0) return 'Không lãi suất';
                              const valStr = debt.interestValue.toLocaleString('vi-VN');
                              if (debt.interestType === 'PERCENT_MONTHLY') return `Lãi: ${valStr}% / tháng`;
                              if (debt.interestType === 'PERCENT_YEARLY') return `Lãi: ${valStr}% / năm`;
                              if (debt.interestType === 'FIXED_MONTHLY') return `Lãi: ${valStr}đ / tháng`;
                              if (debt.interestType === 'FIXED_YEARLY') return `Lãi: ${valStr}đ / năm`;
                              return '';
                            })()}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                        <span className={`${compStyles.badge} ${
                          debt.type === 'LENT' ? compStyles.badgeIncome : compStyles.badgeExpense
                        }`}>
                          {debt.type === 'LENT' ? 'Cho vay' : 'Đi vay'}
                        </span>
                        {debt.status === 'PAID' ? (
                          <span className={`${compStyles.badge} ${compStyles.badgeIncome}`} style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={10} />
                            Đã tất toán
                          </span>
                        ) : isOverdue ? (
                          <span className={`${compStyles.badge} ${compStyles.badgeExpense}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                            <AlertTriangle size={10} />
                            Quá hạn
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Description */}
                    {debt.description && (
                      <p style={{
                        fontSize: '13px',
                        color: 'var(--text-muted)',
                        backgroundColor: 'var(--bg-app)',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        marginTop: '10px',
                        borderLeft: `2px solid ${debt.type === 'LENT' ? 'var(--success)' : 'var(--danger)'}`,
                        fontStyle: 'italic'
                      }}>
                        "{debt.description}"
                      </p>
                    )}
                  </div>

                  {/* Financials details & Progress */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(() => {
                      const interest = calculateAccruedInterest(debt);
                      const totalOwed = debt.remaining + interest;
                      return (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Dư nợ gốc còn lại</span>
                              <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>
                                {formatVND(debt.remaining)}
                              </span>
                            </div>
                            {debt.interestType !== 'NONE' && (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Lãi tích lũy</span>
                                <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--warning)' }}>
                                  +{formatVND(interest)}
                                </span>
                              </div>
                            )}
                          </div>

                          {debt.interestType !== 'NONE' && (
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              backgroundColor: 'var(--bg-app)',
                              padding: '8px 12px',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border-color)',
                              marginTop: '2px'
                            }}>
                              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>Tổng nợ hiện tại:</span>
                              <span style={{
                                fontSize: '16px',
                                fontWeight: 800,
                                color: debt.status === 'PAID' ? 'var(--text-muted)' : (debt.type === 'LENT' ? 'var(--success)' : 'var(--danger)')
                              }}>
                                {formatVND(totalOwed)}
                              </span>
                            </div>
                          )}

                          {debt.interestType === 'NONE' && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Tổng số tiền nợ</span>
                                <span style={{
                                  fontSize: '18px',
                                  fontWeight: 800,
                                  color: debt.status === 'PAID' ? 'var(--text-muted)' : (debt.type === 'LENT' ? 'var(--success)' : 'var(--danger)')
                                }}>
                                  {formatVND(debt.remaining)}
                                </span>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Tiền gốc ban đầu</span>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                                  {formatVND(debt.amount)}
                                </span>
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}

                    {/* Progress bar */}
                    <div style={{ marginTop: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        <span>Đã trả: {formatVND(totalRepaid)}</span>
                        <span>{repaidPercent}%</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                        <div style={{
                          width: `${repaidPercent}%`,
                          height: '100%',
                          backgroundColor: debt.type === 'LENT' ? 'var(--success)' : 'var(--danger)',
                          borderRadius: 'var(--radius-full)',
                          transition: 'width 0.4s ease'
                        }} />
                      </div>
                    </div>

                    {/* Dates */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '4px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} />
                        Ngày: {dateStr}
                      </span>
                      {dueDateStr && (
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: isOverdue ? 'var(--danger)' : 'var(--text-muted)',
                          fontWeight: isOverdue ? 700 : 'normal'
                        }}>
                          <Clock size={12} />
                          Hạn trả: {dueDateStr}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {debt.status === 'OPEN' && (
                        <button
                          onClick={() => openPaymentModal(debt)}
                          className={`${compStyles.btn} ${debt.type === 'LENT' ? compStyles.btnPrimary : compStyles.btnDanger}`}
                          style={{ padding: '8px 12px', fontSize: '12px', height: '32px' }}
                        >
                          <Coins size={14} />
                          <span>{debt.type === 'LENT' ? 'Thu nợ' : 'Trả nợ'}</span>
                        </button>
                      )}
                      {debt.payments && debt.payments.length > 0 && (
                        <button
                          onClick={() => openHistoryModal(debt)}
                          className={`${compStyles.btn} ${compStyles.btnSecondary}`}
                          style={{ padding: '8px 12px', fontSize: '12px', height: '32px' }}
                          title="Lịch sử đợt thanh toán"
                        >
                          <History size={14} />
                          <span>Lịch sử ({debt.payments.length})</span>
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => openEditDebtModal(debt)}
                        className={styles.iconBtn}
                        title="Chỉnh sửa thông tin"
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteDebt(debt.id)}
                        className={`${styles.iconBtn} ${styles.iconBtnDelete}`}
                        title="Xóa khoản nợ"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ================= MODAL: ADD / EDIT DEBT ================= */}
        {debtModalOpen && (
          <div className={styles.modalOverlay} onClick={() => !formLoading && setDebtModalOpen(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>
                  {debtForm.id ? 'Chỉnh sửa khoản nợ' : 'Thêm khoản nợ mới'}
                </h2>
                <button onClick={() => setDebtModalOpen(false)} className={styles.modalClose} disabled={formLoading}>
                  <X size={20} />
                </button>
              </div>

              {formError && (
                <div className={compStyles.errorAlert} style={{ marginBottom: '16px' }}>
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleDebtSubmit}>
                {/* Switch Type: LENT vs BORROWED */}
                <div className={compStyles.inputGroup}>
                  <label className={compStyles.label}>Hình thức nợ</label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      type="button"
                      className={`${compStyles.btn} ${
                        debtForm.type === 'LENT' ? compStyles.btnPrimary : compStyles.btnSecondary
                      }`}
                      style={{ flex: 1 }}
                      onClick={() => setDebtForm({ ...debtForm, type: 'LENT' })}
                      disabled={formLoading}
                    >
                      Cho vay (Họ nợ tôi)
                    </button>
                    <button
                      type="button"
                      className={`${compStyles.btn} ${
                        debtForm.type === 'BORROWED' ? compStyles.btnDanger : compStyles.btnSecondary
                      }`}
                      style={{ flex: 1 }}
                      onClick={() => setDebtForm({ ...debtForm, type: 'BORROWED' })}
                      disabled={formLoading}
                    >
                      Đi vay (Tôi nợ họ)
                    </button>
                  </div>
                </div>

                {/* Partner Name & Phone in Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px' }}>
                  <div className={compStyles.inputGroup}>
                    <label htmlFor="partnerName" className={compStyles.label}>Tên đối tác</label>
                    <input
                      id="partnerName"
                      type="text"
                      placeholder="Nguyễn Văn A"
                      value={debtForm.partnerName}
                      onChange={(e) => setDebtForm({ ...debtForm, partnerName: e.target.value })}
                      className={compStyles.input}
                      required
                      disabled={formLoading}
                    />
                  </div>
                  <div className={compStyles.inputGroup}>
                    <label htmlFor="partnerPhone" className={compStyles.label}>SĐT liên hệ</label>
                    <input
                      id="partnerPhone"
                      type="text"
                      placeholder="0912..."
                      value={debtForm.partnerPhone}
                      onChange={(e) => setDebtForm({ ...debtForm, partnerPhone: e.target.value })}
                      className={compStyles.input}
                      disabled={formLoading}
                    />
                  </div>
                </div>

                {/* Amount input */}
                <div className={compStyles.inputGroup}>
                  <label htmlFor="debtAmount" className={compStyles.label}>Số tiền nợ (VND)</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--text-muted)' }}>₫</span>
                    <input
                      id="debtAmount"
                      type="text"
                      placeholder="5.000.000"
                      value={debtForm.amount}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '');
                        const formatted = raw.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                        setDebtForm({ ...debtForm, amount: formatted });
                      }}
                      className={compStyles.input}
                      style={{ paddingLeft: '36px', fontSize: '16px', fontWeight: 700 }}
                      required
                      disabled={formLoading}
                    />
                  </div>
                </div>
                {/* Interest rate setup */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                  <div className={compStyles.inputGroup}>
                    <label htmlFor="interestType" className={compStyles.label}>Loại lãi suất</label>
                    <select
                      id="interestType"
                      value={debtForm.interestType}
                      onChange={(e: any) => setDebtForm({ ...debtForm, interestType: e.target.value })}
                      className={`${compStyles.input} ${compStyles.select}`}
                      disabled={formLoading}
                    >
                      <option value="NONE">Không tính lãi</option>
                      <option value="PERCENT_MONTHLY">% theo tháng</option>
                      <option value="PERCENT_YEARLY">% theo năm</option>
                      <option value="FIXED_MONTHLY">Cố định theo tháng (đ)</option>
                      <option value="FIXED_YEARLY">Cố định theo năm (đ)</option>
                    </select>
                  </div>
                  {debtForm.interestType !== 'NONE' && (
                    <div className={compStyles.inputGroup}>
                      <label htmlFor="interestValue" className={compStyles.label}>
                        {debtForm.interestType.startsWith('PERCENT') ? 'Lãi suất (%)' : 'Số tiền lãi (đ)'}
                      </label>
                      <input
                        id="interestValue"
                        type={debtForm.interestType.startsWith('PERCENT') ? "number" : "text"}
                        placeholder={debtForm.interestType.startsWith('PERCENT') ? "1.5" : "100.000"}
                        value={debtForm.interestValue}
                        onChange={(e) => {
                          if (debtForm.interestType.startsWith('PERCENT')) {
                            setDebtForm({ ...debtForm, interestValue: e.target.value });
                          } else {
                            const raw = e.target.value.replace(/\D/g, '');
                            const formatted = raw.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                            setDebtForm({ ...debtForm, interestValue: formatted });
                          }
                        }}
                        className={compStyles.input}
                        required
                        disabled={formLoading}
                        min={debtForm.interestType.startsWith('PERCENT') ? "0" : undefined}
                        step={debtForm.interestType.startsWith('PERCENT') ? "0.01" : undefined}
                      />
                    </div>
                  )}
                </div>

                {/* Dates in Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className={compStyles.inputGroup}>
                    <label htmlFor="debtDate" className={compStyles.label}>Ngày vay/cho vay</label>
                    <input
                      id="debtDate"
                      type="date"
                      value={debtForm.date}
                      onChange={(e) => setDebtForm({ ...debtForm, date: e.target.value })}
                      className={compStyles.input}
                      required
                      disabled={formLoading}
                    />
                  </div>
                  <div className={compStyles.inputGroup}>
                    <label htmlFor="debtDueDate" className={compStyles.label}>Hạn trả nợ (Không bắt buộc)</label>
                    <input
                      id="debtDueDate"
                      type="date"
                      value={debtForm.dueDate}
                      onChange={(e) => setDebtForm({ ...debtForm, dueDate: e.target.value })}
                      className={compStyles.input}
                      disabled={formLoading}
                    />
                  </div>
                </div>

                {/* Description */}
                <div className={compStyles.inputGroup}>
                  <label htmlFor="debtDescription" className={compStyles.label}>Mô tả / Mục đích vay</label>
                  <input
                    id="debtDescription"
                    type="text"
                    placeholder="Vay mua máy tính, mua sắm đồ dùng..."
                    value={debtForm.description}
                    onChange={(e) => setDebtForm({ ...debtForm, description: e.target.value })}
                    className={compStyles.input}
                    disabled={formLoading}
                  />
                </div>

                {/* Sync Toggles - only show when creating new debt */}
                {!debtForm.id && (
                  <div className={compStyles.inputGroup} style={{
                    backgroundColor: 'var(--bg-app)',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px dashed var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <input
                      id="syncToTransactions"
                      type="checkbox"
                      checked={debtForm.syncToTransactions}
                      onChange={(e) => setDebtForm({ ...debtForm, syncToTransactions: e.target.checked })}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      disabled={formLoading}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label htmlFor="syncToTransactions" style={{ fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
                        Đồng bộ vào lịch sử giao dịch chung
                      </label>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {debtForm.type === 'LENT'
                          ? 'Tự động tạo giao dịch CHI TIÊU tương ứng để trừ số dư ví.'
                          : 'Tự động tạo giao dịch THU NHẬP tương ứng để cộng số dư ví.'
                        }
                      </span>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className={styles.modalActions}>
                  <button
                    type="button"
                    onClick={() => setDebtModalOpen(false)}
                    className={`${compStyles.btn} ${compStyles.btnSecondary}`}
                    disabled={formLoading}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className={`${compStyles.btn} ${compStyles.btnPrimary}`}
                    disabled={formLoading}
                  >
                    {formLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin-fast" />
                        Đang lưu...
                      </>
                    ) : (
                      'Lưu khoản nợ'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= MODAL: RECORD PAYMENT ================= */}
        {paymentModalOpen && activeDebt && (
          <div className={styles.modalOverlay} onClick={() => !formLoading && setPaymentModalOpen(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>
                  {activeDebt.type === 'LENT' ? 'Ghi nhận Thu nợ' : 'Ghi nhận Trả nợ'}
                </h2>
                <button onClick={() => setPaymentModalOpen(false)} className={styles.modalClose} disabled={formLoading}>
                  <X size={20} />
                </button>
              </div>

              {/* Debt info banner */}
              {(() => {
                const interest = calculateAccruedInterest(activeDebt);
                const totalOwed = activeDebt.remaining + interest;
                return (
                  <div style={{
                    backgroundColor: 'var(--bg-app)',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '16px',
                    border: '1px solid var(--border-color)',
                    fontSize: '13px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Đối tác:</span>
                      <span style={{ fontWeight: 700 }}>{activeDebt.partnerName}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Dư nợ gốc còn lại:</span>
                      <span style={{ fontWeight: 700 }}>{formatVND(activeDebt.remaining)}</span>
                    </div>
                    {activeDebt.interestType !== 'NONE' && (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Lãi tích lũy đến nay:</span>
                          <span style={{ fontWeight: 700, color: 'var(--warning)' }}>+{formatVND(interest)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-color)', paddingTop: '4px', marginTop: '2px' }}>
                          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Tổng số tiền cần trả:</span>
                          <span style={{ fontWeight: 800, color: activeDebt.type === 'LENT' ? 'var(--success)' : 'var(--danger)' }}>
                            {formatVND(totalOwed)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                );
              })()}

              {formError && (
                <div className={compStyles.errorAlert} style={{ marginBottom: '16px' }}>
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handlePaymentSubmit}>
                {/* Repayment Amount */}
                <div className={compStyles.inputGroup}>
                  <label htmlFor="payAmount" className={compStyles.label}>Số tiền trả đợt này (VND)</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--text-muted)' }}>₫</span>
                    <input
                      id="payAmount"
                      type="text"
                      placeholder="1.000.000"
                      value={paymentForm.amount}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '');
                        const formatted = raw.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                        setPaymentForm({ ...paymentForm, amount: formatted });
                      }}
                      className={compStyles.input}
                      style={{ paddingLeft: '36px', fontSize: '16px', fontWeight: 700 }}
                      required
                      disabled={formLoading}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        const interest = calculateAccruedInterest(activeDebt);
                        setPaymentForm({ ...paymentForm, amount: Math.round(activeDebt.remaining + interest).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') });
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary)',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0
                      }}
                      disabled={formLoading}
                    >
                      Trả hết cả gốc lẫn lãi
                    </button>
                  </div>
                </div>

                {/* Repayment Date */}
                <div className={compStyles.inputGroup}>
                  <label htmlFor="payDate" className={compStyles.label}>Ngày trả tiền</label>
                  <input
                    id="payDate"
                    type="date"
                    value={paymentForm.date}
                    onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                    className={compStyles.input}
                    required
                    disabled={formLoading}
                  />
                </div>

                {/* Description notes */}
                <div className={compStyles.inputGroup}>
                  <label htmlFor="payDesc" className={compStyles.label}>Ghi chú đợt trả (Không bắt buộc)</label>
                  <input
                    id="payDesc"
                    type="text"
                    placeholder="Trả đợt 1, thanh toán hết..."
                    value={paymentForm.description}
                    onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                    className={compStyles.input}
                    disabled={formLoading}
                  />
                </div>

                {/* Sync check */}
                <div className={compStyles.inputGroup} style={{
                  backgroundColor: 'var(--bg-app)',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px dashed var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <input
                    id="paymentSync"
                    type="checkbox"
                    checked={paymentForm.syncToTransactions}
                    onChange={(e) => setPaymentForm({ ...paymentForm, syncToTransactions: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    disabled={formLoading}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label htmlFor="paymentSync" style={{ fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
                      Đồng bộ vào lịch sử giao dịch chung
                    </label>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {activeDebt.type === 'LENT'
                        ? 'Tự động tạo giao dịch THU NHẬP (tiền chảy lại vào ví).'
                        : 'Tự động tạo giao dịch CHI TIÊU (tiền chảy ra ngoài ví).'
                      }
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className={styles.modalActions}>
                  <button
                    type="button"
                    onClick={() => setPaymentModalOpen(false)}
                    className={`${compStyles.btn} ${compStyles.btnSecondary}`}
                    disabled={formLoading}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className={`${compStyles.btn} ${activeDebt.type === 'LENT' ? compStyles.btnPrimary : compStyles.btnDanger}`}
                    disabled={formLoading}
                  >
                    {formLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin-fast" />
                        Đang ghi nhận...
                      </>
                    ) : (
                      'Xác nhận thanh toán'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= MODAL: PAYMENT HISTORY ================= */}
        {historyModalOpen && activeDebt && (
          <div className={styles.modalOverlay} onClick={() => setHistoryModalOpen(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <History size={20} />
                  Lịch sử thanh toán
                </h2>
                <button onClick={() => setHistoryModalOpen(false)} className={styles.modalClose}>
                  <X size={20} />
                </button>
              </div>

              {/* Debt overview card in history modal */}
              <div style={{
                backgroundColor: 'var(--bg-app)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '16px',
                border: '1px solid var(--border-color)',
                fontSize: '13px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Đối tác:</span>
                  <span style={{ fontWeight: 700 }}>{activeDebt.partnerName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Đã thanh toán:</span>
                  <span style={{ fontWeight: 700, color: 'var(--success)' }}>
                    {formatVND(activeDebt.amount - activeDebt.remaining)} / {formatVND(activeDebt.amount)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Dư nợ còn lại:</span>
                  <span style={{ fontWeight: 800, color: activeDebt.type === 'LENT' ? 'var(--success)' : 'var(--danger)' }}>
                    {formatVND(activeDebt.remaining)}
                  </span>
                </div>
              </div>

              {/* Payments log list */}
              <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
                {activeDebt.payments && activeDebt.payments.length > 0 ? (
                  activeDebt.payments.map((p: any) => {
                    const payDateStr = new Date(p.date).toLocaleDateString('vi-VN');
                    return (
                      <div
                        key={p.id}
                        style={{
                          backgroundColor: 'var(--bg-card)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '12px 14px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '12px'
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden' }}>
                          <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>
                            {formatVND(p.amount)}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={10} />
                            {payDateStr}
                          </span>
                          {p.description && (
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              "{p.description}"
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => handleDeletePayment(p.id)}
                          className={styles.iconBtn}
                          style={{ color: 'var(--danger)', backgroundColor: 'var(--danger-light)', border: 'none', padding: '6px', borderRadius: '4px' }}
                          title="Xóa đợt thanh toán này"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>
                    Chưa có lịch sử thanh toán nào cho khoản nợ này.
                  </div>
                )}
              </div>

              <div className={styles.modalActions} style={{ marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setHistoryModalOpen(false)}
                  className={`${compStyles.btn} ${compStyles.btnSecondary}`}
                  style={{ width: '100%' }}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
        </PullToRefresh>
      </main>
    </div>
  );
}
