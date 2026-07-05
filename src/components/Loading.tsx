import React from 'react';
import compStyles from '@/styles/components.module.css';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  minHeight?: string;
  overlay?: boolean;
  fullScreen?: boolean;
}

export default function Loading({
  size = 'md',
  text = 'Đang tải...',
  minHeight = '300px',
  overlay = false,
  fullScreen = false,
}: LoadingProps) {
  // Dimensions based on size choice
  const dims = {
    sm: { img: 24, logoBg: 38 },
    md: { img: 40, logoBg: 58 },
    lg: { img: 56, logoBg: 80 },
  }[size];

  const content = (
    <div 
      className={compStyles.loadingContainer}
      style={{ minHeight: (overlay || fullScreen) ? 'auto' : minHeight }}
    >
      {/* Logo container that pulses/flashes */}
      <div 
        className={`${compStyles.loadingLogoWrapper} ${compStyles.loadingLogoPulse}`}
        style={{
          width: dims.logoBg,
          height: dims.logoBg,
        }}
      >
        <img 
          src="/images/logo.png?v=0.01" 
          alt="Logo" 
          width={dims.img} 
          height={dims.img} 
          style={{ borderRadius: size === 'sm' ? '6px' : '8px' }}
        />
      </div>

      {text && (
        <span className={compStyles.loadingText}>
          {text}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className={compStyles.loadingFullScreen}>
        {content}
      </div>
    );
  }

  if (overlay) {
    return (
      <div className={compStyles.loadingOverlay}>
        {content}
      </div>
    );
  }

  return content;
}
