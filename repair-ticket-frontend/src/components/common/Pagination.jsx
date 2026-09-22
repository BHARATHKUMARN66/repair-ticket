import React from 'react';
import { Button } from './Button';

/**
 * Enterprise Pagination Primitive
 */
export function Pagination({
  currentPage = 0, // 0-indexed as used by Spring Boot Pageable
  totalPages = 1,
  totalElements = 0,
  pageSize = 10,
  onPageChange,
  itemLabel = 'records',
  className = '',
  style = {},
}) {
  if (totalPages <= 1 && totalElements <= pageSize) {
    return null;
  }

  const startRecord = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const endRecord = Math.min((currentPage + 1) * pageSize, totalElements);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(0, currentPage - 2);
    let end = Math.min(totalPages - 1, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(0, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div
      className={`pagination-container ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        padding: '12px 4px',
        fontSize: '0.8125rem',
        color: '#64748b',
        ...style,
      }}
    >
      <div>
        Showing <strong style={{ color: '#0f172a' }}>{startRecord}</strong>–<strong style={{ color: '#0f172a' }}>{endRecord}</strong> of{' '}
        <strong style={{ color: '#0f172a' }}>{totalElements}</strong> {itemLabel}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 0}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous Page"
        >
          &larr; Previous
        </Button>

        {getPageNumbers().map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            style={{
              minWidth: 32,
              height: 32,
              padding: '0 6px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              borderRadius: 6,
              border: p === currentPage ? '1px solid #2563eb' : '1px solid #e2e8f0',
              background: p === currentPage ? '#2563eb' : '#ffffff',
              color: p === currentPage ? '#ffffff' : '#334155',
              cursor: 'pointer',
              transition: 'all 120ms ease',
            }}
          >
            {p + 1}
          </button>
        ))}

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages - 1}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next Page"
        >
          Next &rarr;
        </Button>
      </div>
    </div>
  );
}
