'use client';

import React, { useState, useEffect, useRef } from 'react';
import compStyles from '@/styles/components.module.css';

interface PullToRefreshProps {
  onRefresh: () => Promise<any>;
  children: React.ReactNode;
}

export default function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshState, setRefreshState] = useState<'idle' | 'pulling' | 'threshold' | 'refreshing'>('idle');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const isPulling = useRef(false);

  const THRESHOLD = 65; // px required to refresh
  const MAX_PULL = 110; // maximum pull px

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    // Dynamically search for the scrollable container above this element
    const getScrollParent = (node: HTMLElement | null): HTMLElement => {
      if (!node) return document.documentElement;
      
      const styles = window.getComputedStyle(node);
      const overflowY = styles.overflowY || styles.overflow;
      const isScrollable = overflowY === 'auto' || overflowY === 'scroll';
      
      if (isScrollable && node.scrollHeight > node.clientHeight) {
        return node;
      }
      
      return getScrollParent(node.parentElement);
    };

    const scrollParent = getScrollParent(wrapper);

    const handleTouchStart = (e: TouchEvent) => {
      // Allow pull to refresh only when the scrollable parent is at the very top (scrollTop <= 0)
      const scrollTop = scrollParent === document.documentElement ? window.scrollY : scrollParent.scrollTop;
      
      if (scrollTop <= 0) {
        startY.current = e.touches[0].pageY;
        isPulling.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling.current) return;

      const currentY = e.touches[0].pageY;
      const diff = currentY - startY.current;

      if (diff > 0) {
        // User is pulling down
        // Apply resistance formula for organic feel (rubber band effect)
        const distance = Math.min(MAX_PULL, diff * 0.45);
        setPullDistance(distance);

        if (distance >= THRESHOLD) {
          setRefreshState('threshold');
        } else {
          setRefreshState('pulling');
        }

        // Prevent native bounce / overflow scrolling effects when custom pull is active
        if (e.cancelable) {
          e.preventDefault();
        }
      } else {
        // Dragging up, reset pull gesture
        isPulling.current = false;
        setPullDistance(0);
        setRefreshState('idle');
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling.current) return;
      isPulling.current = false;

      if (pullDistance >= THRESHOLD) {
        setRefreshState('refreshing');
        setPullDistance(THRESHOLD); // Dock at loading position

        try {
          await onRefresh();
        } catch (err) {
          console.error('Pull-to-refresh failed', err);
        } finally {
          // Reset states with transition
          setRefreshState('idle');
          setPullDistance(0);
        }
      } else {
        setRefreshState('idle');
        setPullDistance(0);
      }
    };

    // Passive false is required to allow e.preventDefault() during touchmove
    wrapper.addEventListener('touchstart', handleTouchStart, { passive: true });
    wrapper.addEventListener('touchmove', handleTouchMove, { passive: false });
    wrapper.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      wrapper.removeEventListener('touchstart', handleTouchStart);
      wrapper.removeEventListener('touchmove', handleTouchMove);
      wrapper.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, onRefresh]);

  return (
    <div ref={wrapperRef} className={compStyles.ptrWrapper}>
      <div 
        className={compStyles.ptrIndicator}
        style={{ 
          transform: `translateY(${Math.min(pullDistance, THRESHOLD)}px)`,
          opacity: pullDistance > 0 ? Math.min(1, pullDistance / THRESHOLD) : 0,
          transition: refreshState === 'idle' ? 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease' : 'none'
        }}
      >
        <div className={compStyles.ptrContent}>
          {refreshState === 'refreshing' ? (
            <div className={compStyles.ptrPulseLogo}>
              <img 
                src="/images/logo.png?v=0.01" 
                alt="Loading" 
                width={18} 
                height={18} 
                className={compStyles.ptrSpinLogo}
              />
            </div>
          ) : (
            <div 
              className={compStyles.ptrArrow}
              style={{ 
                transform: `rotate(${refreshState === 'threshold' ? 180 : 0}deg)`,
                transition: 'transform 0.2s ease'
              }}
            >
              ↓
            </div>
          )}
          <span className={compStyles.ptrText}>
            {refreshState === 'pulling' && 'Kéo xuống để tải lại'}
            {refreshState === 'threshold' && 'Thả tay để tải lại'}
            {refreshState === 'refreshing' && 'Đang làm mới...'}
          </span>
        </div>
      </div>
      <div 
        className={compStyles.ptrContainer}
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: (isPulling.current) ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }}
      >
        {children}
      </div>
    </div>
  );
}
