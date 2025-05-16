import React, { useState } from 'react';
import { ISSUE_STATUSES, ISSUE_STATUS_COLORS_RAW } from '../util/constants';

const OrphanStatusModal = ({
  show,
  onClose,
  orphanStatusCounts,
  totalStatusCounts
}) => {
  // Add state for sorting
  const [sortBy, setSortBy] = useState('orphanCount');
  const [sortDirection, setSortDirection] = useState('desc');

  if (!show) return null;

  // Calculate total orphaned and total issues
  const totalOrphanIssues = orphanStatusCounts.reduce((sum, item) => sum + item.count, 0);
  const totalIssues = Object.values(totalStatusCounts).reduce((sum, count) => sum + count, 0);

  // Handle changing sort method
  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      // Toggle direction if clicking the same sort method
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
    } else {
      // Default to descending when changing sort method
      setSortBy(newSortBy);
      setSortDirection('desc');
    }
  };

  // Helper to render sort indicators
  const renderSortIndicator = (column) => {
    if (sortBy !== column) return null;
    return sortDirection === 'desc' ? ' ▼' : ' ▲';
  };

  // Sort the status counts based on the selected sort method
  const sortedStatusCounts = [...orphanStatusCounts].sort((a, b) => {
    let aValue, bValue;

    switch(sortBy) {
      case 'status':
        aValue = ISSUE_STATUSES[a.status] || `Status ${a.status}`;
        bValue = ISSUE_STATUSES[b.status] || `Status ${b.status}`;
        return sortDirection === 'desc'
          ? bValue.localeCompare(aValue)
          : aValue.localeCompare(bValue);
      case 'totalCount':
        aValue = totalStatusCounts[a.status] || 0;
        bValue = totalStatusCounts[b.status] || 0;
        break;
      case 'percentage':
        const aTotal = totalStatusCounts[a.status] || 0;
        const bTotal = totalStatusCounts[b.status] || 0;
        aValue = aTotal > 0 ? (a.count / aTotal) : 0;
        bValue = bTotal > 0 ? (b.count / bTotal) : 0;
        break;
      case 'orphanCount':
      default:
        aValue = a.count;
        bValue = b.count;
    }

    return sortDirection === 'desc' ? bValue - aValue : aValue - bValue;
  });

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 1001
        }}
        onClick={onClose}
      />
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '5px',
        boxShadow: '0 0 10px rgba(0,0,0,0.3)',
        zIndex: 1002,
        maxWidth: '700px',
        width: '80%',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <h2 style={{ margin: 0 }}>Orphan Issues by Status</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer'
            }}
          >
            X
          </button>
        </div>

        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: '15px',
          fontSize: '14px'
        }}>
          <thead>
            <tr>
              <th style={{
                textAlign: 'left',
                padding: '8px 10px',
                borderBottom: '2px solid #ddd',
                cursor: 'pointer'
              }}
                onClick={() => handleSortChange('status')}
              >
                Status {renderSortIndicator('status')}
              </th>
              <th style={{
                textAlign: 'right',
                padding: '8px',
                borderBottom: '2px solid #ddd',
                cursor: 'pointer'
              }}
                onClick={() => handleSortChange('orphanCount')}
              >
                Orphan Count {renderSortIndicator('orphanCount')}
              </th>
              <th style={{
                textAlign: 'right',
                padding: '8px',
                borderBottom: '2px solid #ddd',
                cursor: 'pointer'
              }}
                onClick={() => handleSortChange('totalCount')}
              >
                Total Count {renderSortIndicator('totalCount')}
              </th>
              <th style={{
                textAlign: 'right',
                padding: '8px',
                borderBottom: '2px solid #ddd',
                cursor: 'pointer'
              }}
                onClick={() => handleSortChange('percentage')}
              >
                Percentage {renderSortIndicator('percentage')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedStatusCounts.map((item, index) => {
              const totalForStatus = totalStatusCounts[item.status] || 0;
              const percentage = totalForStatus > 0 ?
                Math.round((item.count / totalForStatus) * 100) : 0;
              const backgroundColor = index % 2 === 0 ? '#f5f5f5' : '#ffffff';

              return (
                <tr
                  key={item.status}
                  style={{
                    backgroundColor
                  }}
                >
                  <td style={{
                    padding: '10px',
                    borderBottom: '1px solid #eee',
                    fontWeight: sortBy === 'status' ? 'bold' : 'normal',
                    backgroundColor: ISSUE_STATUS_COLORS_RAW[item.status] || '#ccc',
                  }}>
                    {ISSUE_STATUSES[item.status] || `Status ${item.status}`}
                  </td>
                  <td style={{
                    textAlign: 'right',
                    padding: '10px',
                    borderBottom: '1px solid #eee',
                    fontWeight: sortBy === 'orphanCount' ? 'bold' : 'normal'
                  }}>
                    {item.count.toLocaleString()}
                  </td>
                  <td style={{
                    textAlign: 'right',
                    padding: '10px',
                    borderBottom: '1px solid #eee',
                    fontWeight: sortBy === 'totalCount' ? 'bold' : 'normal'
                  }}>
                    {totalForStatus.toLocaleString()}
                  </td>
                  <td style={{
                    textAlign: 'right',
                    padding: '10px',
                    borderBottom: '1px solid #eee',
                    fontWeight: sortBy === 'percentage' ? 'bold' : 'normal'
                  }}>
                    {percentage}%
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ fontWeight: 'bold' }}>
              <td style={{ padding: '10px', borderTop: '2px solid #ddd' }}>
                Totals
              </td>
              <td style={{
                textAlign: 'right',
                padding: '10px',
                borderTop: '2px solid #ddd'
              }}>
                {totalOrphanIssues.toLocaleString()}
              </td>
              <td style={{
                textAlign: 'right',
                padding: '10px',
                borderTop: '2px solid #ddd'
              }}>
                {totalIssues.toLocaleString()}
              </td>
              <td style={{
                textAlign: 'right',
                padding: '10px',
                borderTop: '2px solid #ddd'
              }}>
                {Math.round((totalOrphanIssues / totalIssues) * 100)}%
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  );
};

export default OrphanStatusModal;
