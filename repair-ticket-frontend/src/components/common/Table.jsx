import React from 'react';

/**
 * Enterprise Data Table Primitive
 * High density, crisp borders, subtle hover state, accessible headers.
 */
export function Table({
  columns = [],
  data = [],
  keyExtractor,
  emptyMessage = 'No records found.',
  loading = false,
  className = '',
  style = {},
  onRowClick,
}) {
  return (
    <div
      className={`table-responsive-container ${className}`}
      style={{
        width: '100%',
        overflowX: 'auto',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 8,
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
        ...style,
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left',
          fontSize: '0.875rem',
        }}
      >
        <thead>
          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            {columns.map((col, idx) => (
              <th
                key={col.key || idx}
                style={{
                  padding: '10px 16px',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: '#475569',
                  width: col.width || 'auto',
                  textAlign: col.align || 'left',
                  whiteSpace: 'nowrap',
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: '36px 16px', textAlign: 'center', color: '#64748b' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.875rem' }}>
                  <span
                    style={{
                      width: 16,
                      height: 16,
                      border: '2px solid #cbd5e1',
                      borderTopColor: '#2563eb',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
                  <span>Loading records...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: '40px 16px', textAlign: 'center', color: '#64748b' }}>
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{emptyMessage}</div>
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => {
              const rowKey = keyExtractor ? keyExtractor(row, rowIdx) : row.id || rowIdx;
              return (
                <tr
                  key={rowKey}
                  onClick={(e) => {
                    if (onRowClick) onRowClick(row, e);
                  }}
                  style={{
                    borderBottom: rowIdx === data.length - 1 ? 'none' : '1px solid #f1f5f9',
                    transition: 'background-color 100ms ease',
                    background: '#ffffff',
                    cursor: onRowClick ? 'pointer' : 'default',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={col.key || colIdx}
                      style={{
                        padding: '12px 16px',
                        color: '#0f172a',
                        verticalAlign: 'middle',
                        textAlign: col.align || 'left',
                        whiteSpace: col.nowrap ? 'nowrap' : 'normal',
                      }}
                    >
                      {col.render ? col.render(row, rowIdx) : row[col.key]}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
