import React from 'react';

/**
 * Enterprise Shimmer Loading Skeleton Primitive
 */
export function LoadingSkeleton({
  type = 'table', // 'table' | 'card' | 'stats' | 'text'
  rows = 5,
  cols = 5,
  className = '',
  style = {},
}) {
  const shimmerStyle = {
    background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
    backgroundSize: '200% 100%',
    animation: 'skeletonShimmer 1.5s infinite ease-in-out',
    borderRadius: 4,
  };

  if (type === 'stats') {
    return (
      <div
        className={`skeleton-stats-grid ${className}`}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          ...style,
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: '16px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '60%' }}>
              <div style={{ width: '50%', height: 12, ...shimmerStyle }} />
              <div style={{ width: '70%', height: 28, ...shimmerStyle }} />
            </div>
            <div style={{ width: 42, height: 42, borderRadius: 8, ...shimmerStyle }} />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div
        className={`skeleton-card ${className}`}
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          ...style,
        }}
      >
        <div style={{ width: '40%', height: 18, ...shimmerStyle }} />
        <div style={{ width: '80%', height: 14, ...shimmerStyle }} />
        <div style={{ width: '100%', height: 80, ...shimmerStyle }} />
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
          <div style={{ width: 70, height: 32, ...shimmerStyle }} />
          <div style={{ width: 100, height: 32, ...shimmerStyle }} />
        </div>
      </div>
    );
  }

  // Default: Table skeleton
  return (
    <div
      className={`skeleton-table ${className}`}
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 8,
        overflow: 'hidden',
        ...style,
      }}
    >
      <div style={{ height: 42, background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '0 16px', display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '30%', height: 14, ...shimmerStyle }} />
      </div>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div
          key={rIdx}
          style={{
            height: 48,
            borderBottom: rIdx === rows - 1 ? 'none' : '1px solid #f1f5f9',
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          {Array.from({ length: cols }).map((_, cIdx) => (
            <div
              key={cIdx}
              style={{
                flex: cIdx === 0 ? '1 1 120px' : cIdx === 1 ? '2 1 200px' : '1 1 100px',
                height: 14,
                ...shimmerStyle,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
