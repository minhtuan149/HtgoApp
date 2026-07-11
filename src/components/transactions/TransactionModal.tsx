'use client';

import React, { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import * as Icons from 'lucide-react';
import styles from '@/styles/dashboard.module.css';
import compStyles from '@/styles/components.module.css';

// Dynamic Lucide Icon mapping
export function CategoryIcon({ name, size = 18, style = {} }: { name: string; size?: number; style?: React.CSSProperties }) {
  const IconComponent = (Icons as any)[name] || Icons.HelpCircle;
  return <IconComponent size={size} style={style} />;
}

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  transaction?: any; // null if creating
  categories: any[];
}

export default function TransactionModal({
  isOpen,
  onClose,
  onSubmit,
  transaction,
  categories,
}: TransactionModalProps) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (transaction) {
      setAmount(Math.round(transaction.amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'));
      setType(transaction.type);
      setCategoryId(transaction.categoryId);
      setDescription(transaction.description);
      // Format date string to YYYY-MM-DD
      const d = new Date(transaction.date);
      const formattedDate = d.toISOString().split('T')[0];
      setDate(formattedDate);
    } else {
      setAmount('');
      setType('EXPENSE');
      setCategoryId('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
    }
    setError('');
  }, [transaction, isOpen]);

  // Handle auto-selection of first matching category when type or list changes
  useEffect(() => {
    const filteredCats = categories.filter((c) => c.type === type);
    if (filteredCats.length > 0 && !filteredCats.some(c => c.id === categoryId)) {
      setCategoryId(filteredCats[0].id);
    }
  }, [type, categories, categoryId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(amount.replace(/\./g, ''));
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError('Vui lòng nhập số tiền hợp lệ lớn hơn 0');
      return;
    }

    if (!categoryId) {
      setError('Vui lòng chọn danh mục cho giao dịch này');
      return;
    }

    if (!description.trim()) {
      setError('Vui lòng nhập mô tả hoặc lý do chi tiêu');
      return;
    }

    setLoading(true);

    try {
      await onSubmit({
        id: transaction?.id,
        amount: numAmount,
        type,
        categoryId,
        description: description.trim(),
        date: date ? new Date(date).toISOString() : new Date().toISOString(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Lỗi xảy ra khi lưu giao dịch');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {transaction ? 'Chỉnh sửa giao dịch' : 'Thêm giao dịch mới'}
          </h2>
          <button onClick={onClose} className={styles.modalClose}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className={compStyles.errorAlert} style={{ marginBottom: '16px' }}>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Switch Income vs Expense */}
          <div className={compStyles.inputGroup}>
            <label className={compStyles.label}>Loại giao dịch</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                className={`${compStyles.btn} ${
                  type === 'EXPENSE' ? compStyles.btnDanger : compStyles.btnSecondary
                }`}
                style={{ flex: 1 }}
                onClick={() => setType('EXPENSE')}
                disabled={loading}
              >
                Chi tiêu (Expense)
              </button>
              <button
                type="button"
                className={`${compStyles.btn} ${
                  type === 'INCOME' ? compStyles.btnPrimary : compStyles.btnSecondary
                }`}
                style={{ flex: 1 }}
                onClick={() => setType('INCOME')}
                disabled={loading}
              >
                Thu nhập (Income)
              </button>
            </div>
          </div>

          {/* Amount input */}
          <div className={compStyles.inputGroup}>
            <label htmlFor="amount" className={compStyles.label}>
              Số tiền (VND)
            </label>
            <div style={{ position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                }}
              >
                ₫
              </span>
              <input
                id="amount"
                type="text"
                placeholder="100.000"
                value={amount}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, '');
                  const formatted = raw.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                  setAmount(formatted);
                }}
                className={compStyles.input}
                style={{ paddingLeft: '36px', fontSize: '16px', fontWeight: 700 }}
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Category Selector Grid */}
          <div className={compStyles.inputGroup}>
            <label className={compStyles.label}>Chọn Danh mục</label>
            <div className={styles.categorySelectGrid}>
              {filteredCategories.map((cat) => (
                <div
                  key={cat.id}
                  className={`${styles.categorySelectOption} ${
                    categoryId === cat.id ? styles.categorySelectOptionSelected : ''
                  }`}
                  onClick={() => setCategoryId(cat.id)}
                >
                  <span
                    className={styles.categoryOptionIcon}
                    style={{ backgroundColor: cat.color }}
                  >
                    <CategoryIcon name={cat.icon} size={16} />
                  </span>
                  <span className={styles.categoryOptionLabel}>{cat.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className={compStyles.inputGroup}>
            <label htmlFor="description" className={compStyles.label}>
              Mô tả giao dịch
            </label>
            <input
              id="description"
              type="text"
              placeholder="Ăn trưa, Nhận lương, Mua sắm siêu thị..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={compStyles.input}
              required
              disabled={loading}
            />
          </div>

          {/* Transaction Date */}
          <div className={compStyles.inputGroup}>
            <label htmlFor="date" className={compStyles.label}>
              Ngày thực hiện
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={compStyles.input}
              required
              disabled={loading}
            />
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              onClick={onClose}
              className={`${compStyles.btn} ${compStyles.btnSecondary}`}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className={`${compStyles.btn} ${compStyles.btnPrimary}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin-fast" />
                  Đang lưu...
                </>
              ) : (
                'Lưu giao dịch'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
