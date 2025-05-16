import React from 'react';
import {
  ISSUE_STATUSES,
  ISSUE_STATUS_COLORS_RAW,
  ISSUE_STATUSES_SHORT,
  ISSUE_STATUSES_ORDER,
} from '../util/constants';

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
        .sort((a, b) => {
            // Get the index of each status in ISSUE_STATUSES
            const indexA = ISSUE_STATUSES_ORDER.indexOf(parseInt(a[0]));
            const indexB = ISSUE_STATUSES_ORDER.indexOf(parseInt(b[0]));

            // If both statuses are in ISSUE_STATUSES, sort by their position
            if (indexA !== -1 && indexB !== -1) {
              return indexA - indexB;
            }

            // If one status is not in ISSUE_STATUSES, prioritize the one that is
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;

            // If neither status is in ISSUE_STATUSES, maintain original order
            return 0;
        }
        ) // Sort by count (descending)
        .map(([status, count]) => (
          <span
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
            onMouseLeave={() => onStatusHover(null)}/*
            title={() => ISSUE_STATUSES[status] || `${status}`}*/
          >
            {ISSUE_STATUSES_SHORT[status] || status}: {count}
          </span>
        ))}
      <div style={{ fontWeight: 'bold' }}>
        Total: {nodes.length}
      </div>
    </div>
  );
};

export default StatusSummary;
