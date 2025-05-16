import React from 'react';
import { ISSUE_STATUSES, ISSUE_STATUS_COLORS_RAW } from '../util/constants';

const StatusSummary = ({ nodes, onStatusHover }) => {
  // Count nodes by status
  const statusCounts = {};
  nodes.forEach(node => {
    const status = node.field_issue_status;
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px',
      fontSize: '12px'
    }}>
      <span style={{ fontWeight: 'bold', marginRight: '4px' }}>
        Status counts:
      </span>
      {Object.entries(statusCounts)
        .sort((a, b) => b[1] - a[1]) // Sort by count (descending)
        .map(([status, count]) => (
          <div
            key={status}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: ISSUE_STATUS_COLORS_RAW[status] || '#ccc',
              padding: '2px 6px',
              borderRadius: '4px',
              color: '#333',
              fontWeight: 'bold',
              cursor: 'pointer',
              border: '1px solid transparent',
              transition: 'border-color 0.2s'
            }}
            onMouseEnter={() => onStatusHover(status)}
            onMouseLeave={() => onStatusHover(null)}
          >
            {ISSUE_STATUSES[status] || status}: {count}
          </div>
        ))}
      <div style={{ fontWeight: 'bold' }}>
        Total: {nodes.length}
      </div>
    </div>
  );
};

export default StatusSummary;
