import React, { useState } from 'react';
import { ISSUE_STATUSES, ISSUE_STATUS_COLORS_RAW } from '../util/constants';

const ComponentStatusModal = ({
  show,
  onClose,
  componentCounts,
  projectName
}) => {
  // Add state for sorting
  const [sortBy, setSortBy] = useState('total');
  const [sortDirection, setSortDirection] = useState('desc');

  if (!show) return null;

  // Calculate total issues across all components
  const totalIssues = componentCounts.reduce((sum, item) => sum + item.count, 0);
  const totalOpenIssues = componentCounts.reduce((sum, item) => sum + item.openCount, 0);
  const totalClosedIssues = totalIssues - totalOpenIssues;

  // Sort the component counts based on the selected sort method
  const sortedComponentCounts = [...componentCounts].sort((a, b) => {
    let aValue, bValue;

    switch(sortBy) {
      case 'component':
        // Handle null component values for sorting
        aValue = (a.component || '').toLowerCase();
        bValue = (b.component || '').toLowerCase();
        // Use string comparison for component names
        return sortDirection === 'desc'
          ? bValue.localeCompare(aValue)
          : aValue.localeCompare(bValue);
      case 'open':
        aValue = a.openCount;
        bValue = b.openCount;
        break;
      case 'closed':
        aValue = a.count - a.openCount;
        bValue = b.count - b.openCount;
        break;
      case 'total':
      default:
        aValue = a.count;
        bValue = b.count;
    }

    // For numeric values
    return sortDirection === 'desc' ? bValue - aValue : aValue - bValue;
  });

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
        maxWidth: '800px',
        width: '80%',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <h2 style={{ margin: 0 }}>{projectName} Issues by Component</h2>
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
                onClick={() => handleSortChange('component')}
              >
                Component {renderSortIndicator('component')}
              </th>
              <th style={{
                textAlign: 'right',
                padding: '8px',
                borderBottom: '2px solid #ddd',
                cursor: 'pointer'
              }}
                onClick={() => handleSortChange('total')}
              >
                Total Issues {renderSortIndicator('total')}
              </th>
              <th style={{
                textAlign: 'right',
                padding: '8px',
                borderBottom: '2px solid #ddd',
                cursor: 'pointer',
                color: '#2c8f00'
              }}
                onClick={() => handleSortChange('open')}
              >
                Open {renderSortIndicator('open')}
              </th>
              <th style={{
                textAlign: 'right',
                padding: '8px',
                borderBottom: '2px solid #ddd',
                cursor: 'pointer',
                color: '#8f3a00'
              }}
                onClick={() => handleSortChange('closed')}
              >
                Closed {renderSortIndicator('closed')}
              </th>
              <th style={{
                textAlign: 'right',
                padding: '8px',
                borderBottom: '2px solid #ddd'
              }}>
                % of Total
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedComponentCounts.map((item, index) => {
              const percentage = Math.round((item.count / totalIssues) * 100);
              const backgroundColor = index % 2 === 0 ? '#f5f5f5' : '#ffffff';
              const closedCount = item.count - item.openCount;

              return (
                <tr
                  key={item.component || 'none'}
                  style={{
                    backgroundColor
                  }}
                >
                  <td style={{
                    padding: '10px',
                    borderBottom: '1px solid #eee',
                    fontWeight: sortBy === 'component' ? 'bold' : 'normal',
                    textAlign: 'left',
                  }}>
                    {item.component || '(No component)'}
                  </td>
                  <td style={{
                    textAlign: 'right',
                    padding: '10px',
                    borderBottom: '1px solid #eee',
                    fontWeight: sortBy === 'total' ? 'bold' : 'normal'
                  }}>
                    {item.count.toLocaleString()}
                  </td>
                  <td style={{
                    textAlign: 'right',
                    padding: '10px',
                    borderBottom: '1px solid #eee',
                    color: '#2c8f00',
                    fontWeight: sortBy === 'open' ? 'bold' : 'normal'
                  }}>
                    {item.openCount.toLocaleString()}
                  </td>
                  <td style={{
                    textAlign: 'right',
                    padding: '10px',
                    borderBottom: '1px solid #eee',
                    color: '#8f3a00',
                    fontWeight: sortBy === 'closed' ? 'bold' : 'normal'
                  }}>
                    {closedCount.toLocaleString()}
                  </td>
                  <td style={{
                    textAlign: 'right',
                    padding: '10px',
                    borderBottom: '1px solid #eee'
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
                {totalIssues.toLocaleString()}
              </td>
              <td style={{
                textAlign: 'right',
                padding: '10px',
                borderTop: '2px solid #ddd',
                color: '#2c8f00'
              }}>
                {totalOpenIssues.toLocaleString()}
              </td>
              <td style={{
                textAlign: 'right',
                padding: '10px',
                borderTop: '2px solid #ddd',
                color: '#8f3a00'
              }}>
                {totalClosedIssues.toLocaleString()}
              </td>
              <td style={{
                textAlign: 'right',
                padding: '10px',
                borderTop: '2px solid #ddd'
              }}>
                100%
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  );
};

export default ComponentStatusModal;
