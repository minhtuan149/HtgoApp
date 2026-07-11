'use client';

import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';

// Format currency helper
const formatVND = (value: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
};

// Custom Tooltip styled with CSS variables
const CustomTooltip = ({ active, payload, label, formatter }: any) => {
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
        {label && <p style={{ fontWeight: 700, marginBottom: '6px' }}>{label}</p>}
        {payload.map((entry: any, index: number) => {
          const color = entry.color || entry.payload?.fill || 'var(--text-main)';
          return (
            <p key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center', margin: '4px 0' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color }}></span>
              <span>{entry.name}:</span>
              <span style={{ fontWeight: 600 }}>{formatter ? formatter(entry.value) : entry.value}</span>
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

// Client mounting protector component
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // Introduce a short timeout to let the page layout settle and obtain computed sizes
    const timer = setTimeout(() => {
      setMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return (
      <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        Đang khởi tạo biểu đồ...
      </div>
    );
  }
  return <>{children}</>;
}

// 1. Pie Chart for Categories
interface CategoryPieData {
  name: string;
  value: number;
  color: string;
}

export function CategoryPieChart({ data }: { data: CategoryPieData[] }) {
  const hasData = data && data.length > 0 && data.some(item => item.value > 0);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <ClientOnly>
      <div style={{ width: '100%', height: isMobile ? '240px' : '300px', position: 'relative', minWidth: 0 }}>
        {!hasData ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
            Không có dữ liệu chi tiêu trong khoảng thời gian này
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <PieChart>
              <Pie
                data={data.filter(item => item.value > 0)}
                cx="50%"
                cy={isMobile ? "40%" : "50%"}
                innerRadius={isMobile ? 45 : 60}
                outerRadius={isMobile ? 70 : 90}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip formatter={formatVND} />} />
              <Legend 
                verticalAlign="bottom" 
                height={isMobile ? 48 : 36} 
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '11px', color: 'var(--text-main)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </ClientOnly>
  );
}

// 2. Bar Chart for Income vs Expense Summary
interface BarChartData {
  name: string;
  'Thu nhập': number;
  'Chi tiêu': number;
}

export function IncomeExpenseBarChart({ data }: { data: BarChartData[] }) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <ClientOnly>
      <div style={{ width: '100%', height: isMobile ? '240px' : '300px', minWidth: 0 }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart
            data={data}
            margin={isMobile ? { top: 10, right: 5, left: -25, bottom: 0 } : { top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
            <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={isMobile ? 10 : 12} tickLine={false} />
            <YAxis stroke="var(--text-muted)" fontSize={isMobile ? 9 : 11} tickLine={false} axisLine={false} tickFormatter={(tick) => `${tick / 1000000}M`} />
            <Tooltip content={<CustomTooltip formatter={formatVND} />} />
            <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: isMobile ? '11px' : '12px' }} />
            <Bar dataKey="Thu nhập" fill="var(--success)" radius={[4, 4, 0, 0]} barSize={isMobile ? 12 : undefined} />
            <Bar dataKey="Chi tiêu" fill="var(--danger)" radius={[4, 4, 0, 0]} barSize={isMobile ? 12 : undefined} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ClientOnly>
  );
}

// 3. Area Chart for Daily Trend
interface DailyTrendData {
  date: string;
  'Thu nhập': number;
  'Chi tiêu': number;
}

export function DailyTrendAreaChart({ data }: { data: DailyTrendData[] }) {
  const hasData = data && data.length > 0;

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <ClientOnly>
      <div style={{ width: '100%', height: isMobile ? '240px' : '300px', minWidth: 0 }}>
        {!hasData ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
            Chưa có dữ liệu xu hướng trong tháng này
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart
              data={data}
              margin={isMobile ? { top: 10, right: 5, left: -25, bottom: 0 } : { top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--success)" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="var(--success)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--danger)" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="var(--danger)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={isMobile ? 9 : 11} tickLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={isMobile ? 9 : 11} tickLine={false} axisLine={false} tickFormatter={(tick) => `${tick / 1000000}M`} />
              <Tooltip content={<CustomTooltip formatter={formatVND} />} />
              <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: isMobile ? '11px' : '12px' }} />
              <Area type="monotone" dataKey="Thu nhập" stroke="var(--success)" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
              <Area type="monotone" dataKey="Chi tiêu" stroke="var(--danger)" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </ClientOnly>
  );
}
