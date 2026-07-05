'use client';

import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Search, 
  Download, 
  Edit, 
  Trash2, 
  Loader2, 
  X, 
  Filter, 
  Calendar, 
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Loading from '@/components/Loading';
import PullToRefresh from '@/components/PullToRefresh';
import TransactionModal, { CategoryIcon } from '@/components/TransactionModal';
import styles from '@/styles/dashboard.module.css';
import compStyles from '@/styles/components.module.css';

// Currency formatter helper
const formatVND = (value: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
};

export default function TransactionsHistoryPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  // Filter states
  const [search, setSearch] = useState('');
  const [type, setType] = useState('ALL');
  const [categoryId, setCategoryId] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const activeFiltersCount = 
    (type !== 'ALL' ? 1 : 0) + 
    (categoryId !== 'ALL' ? 1 : 0) + 
    (startDate ? 1 : 0) + 
    (endDate ? 1 : 0);

  // Fetch transactions and categories from APIs
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      
      // Construct query URL with filters
      const params = new URLSearchParams();
      if (type !== 'ALL') params.append('type', type);
      if (categoryId !== 'ALL') params.append('categoryId', categoryId);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (search.trim()) params.append('search', search.trim());
      
      const res = await fetch(`/api/transactions?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (err) {
      console.error('Failed to load transactions list', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const handleRefresh = async () => {
    await Promise.all([fetchTransactions(), fetchCategories()]);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch transactions whenever filters change (with small delay for text search if needed, but here simple trigger)
  useEffect(() => {
    fetchTransactions();
  }, [type, categoryId, startDate, endDate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTransactions();
  };

  const handleClearFilters = () => {
    setSearch('');
    setType('ALL');
    setCategoryId('ALL');
    setStartDate('');
    setEndDate('');
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
      throw new Error(errData.error || 'Lỗi khi lưu giao dịch');
    }

    // Refresh datasets
    fetchTransactions();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có thực sự muốn xóa giao dịch này?')) return;

    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchTransactions();
      } else {
        const errData = await res.json();
        alert(errData.error || 'Lỗi khi xóa giao dịch');
      }
    } catch (err) {
      console.error(err);
      alert('Không thể kết nối đến máy chủ');
    }
  };

  // Client-side CSV exporter with UTF-8 BOM encoding for correct Excel display of Vietnamese characters
  const exportToCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF'; // UTF-8 BOM
    csvContent += 'Ngày,Mô tả,Loại giao dịch,Số tiền (VND),Danh mục\n';

    transactions.forEach((t) => {
      const dateStr = new Date(t.date).toLocaleDateString('vi-VN');
      const typeStr = t.type === 'INCOME' ? 'Thu nhập' : 'Chi tiêu';
      const catName = t.category?.name || 'Khác';
      // Clean string description
      const desc = t.description.replace(/"/g, '""').replace(/,/g, ' ');
      csvContent += `${dateStr},"${desc}",${typeStr},${t.amount},${catName}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BaoCao_GiaoDich_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={styles.container}>
      <Sidebar />
      
      <main className={styles.main}>
        <PullToRefresh onRefresh={handleRefresh}>
          {/* Header Section */}
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>Quản lý giao dịch</h1>
            <p className={styles.greeting}>Tra cứu, lọc dữ liệu và điều chỉnh các khoản thu chi của bạn.</p>
          </div>
          
          <div className={styles.headerActions}>
            {transactions.length > 0 && (
              <button
                onClick={exportToCSV}
                className={`${compStyles.btn} ${compStyles.btnSecondary}`}
                title="Tải báo cáo CSV"
              >
                <Download size={18} />
                <span>Xuất file</span>
              </button>
            )}
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
        </div>

        {/* Toggle Filters Button for Mobile */}
        <button 
          className={styles.mobileFilterToggle}
          onClick={() => setShowFilters(!showFilters)}
          type="button"
        >
          <Filter size={16} />
          <span>Bộ lọc {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}</span>
          <span style={{ fontSize: '12px', marginLeft: 'auto', color: 'var(--text-muted)' }}>
            {showFilters ? 'Ẩn bớt' : 'Hiển thị'}
          </span>
        </button>

        {/* Filters Panel */}
        <div className={`${styles.filtersPanel} ${showFilters ? styles.filtersPanelOpen : ''}`}>
          {/* Search Term */}
          <form onSubmit={handleSearchSubmit} className={styles.filterGroup} style={{ minWidth: '240px', flex: '2' }}>
            <span className={styles.filterLabel}>Mô tả / Từ khóa</span>
            <div style={{ position: 'relative', display: 'flex' }}>
              <input
                type="text"
                placeholder="Tìm giao dịch ăn trưa, đi chợ..."
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

          {/* Type Select */}
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Phân loại</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className={`${compStyles.input} ${compStyles.select}`}
            >
              <option value="ALL">Tất cả</option>
              <option value="EXPENSE">Khoản chi tiêu</option>
              <option value="INCOME">Khoản thu nhập</option>
            </select>
          </div>

          {/* Category Select */}
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Danh mục</span>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={`${compStyles.input} ${compStyles.select}`}
            >
              <option value="ALL">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.type === 'INCOME' ? '[+]' : '[-]'} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker Start */}
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Từ ngày</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={compStyles.input}
            />
          </div>

          {/* Date Picker End */}
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Đến ngày</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={compStyles.input}
            />
          </div>

          {/* Reset Filters */}
          <button
            onClick={handleClearFilters}
            className={`${compStyles.btn} ${compStyles.btnSecondary}`}
            style={{ height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Làm mới bộ lọc"
          >
            <RefreshCw size={16} />
            <span>Xóa lọc</span>
          </button>
        </div>

        {/* Transactions Table Section */}
        {loading ? (
          <Loading size="lg" minHeight="300px" />
        ) : transactions.length === 0 ? (
          <div className={styles.tableCard} style={{ padding: '60px 20px' }}>
            <div className={styles.emptyState}>
              <FolderOpen size={48} className={styles.emptyStateIcon} />
              <span className={styles.emptyStateTitle}>Không tìm thấy giao dịch nào</span>
              <span className={styles.emptyStateDesc}>Thử điều chỉnh lại bộ lọc hoặc tạo mới các giao dịch chi tiêu/thu nhập.</span>
            </div>
          </div>
        ) : (
          <div className={styles.tableCard}>
            {/* Desktop Table View */}
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Ngày</th>
                    <th className={styles.th}>Mô tả</th>
                    <th className={styles.th}>Danh mục</th>
                    <th className={styles.th}>Phân loại</th>
                    <th className={styles.th}>Số tiền</th>
                    <th className={styles.th} style={{ textAlign: 'right' }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id} className={styles.tr}>
                      <td className={styles.td}>
                        {new Date(t.date).toLocaleDateString('vi-VN')}
                      </td>
                      <td className={styles.td}>
                        <span className={styles.transactionDesc}>{t.description}</span>
                      </td>
                      <td className={styles.td}>
                        <div className={styles.transactionCategory}>
                          <span 
                            className={styles.categoryDot} 
                            style={{ backgroundColor: t.category?.color || '#9ca3af' }}
                          ></span>
                          <span>{t.category?.name || 'Chưa phân loại'}</span>
                        </div>
                      </td>
                      <td className={styles.td}>
                        <span className={`${compStyles.badge} ${
                          t.type === 'INCOME' ? compStyles.badgeIncome : compStyles.badgeExpense
                        }`}>
                          {t.type === 'INCOME' ? 'Thu nhập' : 'Chi tiêu'}
                        </span>
                      </td>
                      <td className={styles.td}>
                        <span style={{ 
                          fontWeight: 700, 
                          color: t.type === 'INCOME' ? 'var(--success)' : 'var(--danger)' 
                        }}>
                          {t.type === 'INCOME' ? '+' : '-'}{formatVND(t.amount)}
                        </span>
                      </td>
                      <td className={styles.td} style={{ textAlign: 'right' }}>
                        <div className={styles.actionCell}>
                          <button
                            onClick={() => {
                              setSelectedTransaction(t);
                              setModalOpen(true);
                            }}
                            className={styles.iconBtn}
                            title="Chỉnh sửa"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(t.id)}
                            className={`${styles.iconBtn} ${styles.iconBtnDelete}`}
                            title="Xóa giao dịch"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile List View */}
            <div className={styles.mobileTxList}>
              {transactions.map((t) => (
                <div key={t.id} className={styles.mobileTxItem}>
                  <div className={styles.mobileTxLeft}>
                    <div 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        width: '38px', 
                        height: '38px', 
                        borderRadius: '50%', 
                        backgroundColor: t.category?.color || '#9ca3af',
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {new Date(t.date).toLocaleDateString('vi-VN')}
                        </span>
                        <span className={`${compStyles.badge} ${
                          t.type === 'INCOME' ? compStyles.badgeIncome : compStyles.badgeExpense
                        }`} style={{ fontSize: '9px', padding: '1px 6px' }}>
                          {t.category?.name || 'Khác'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.mobileTxRight}>
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
                        title="Chỉnh sửa"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className={`${styles.iconBtn} ${styles.iconBtnDelete}`}
                        title="Xóa giao dịch"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        </PullToRefresh>

        {/* Edit/Create Modal */}
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
