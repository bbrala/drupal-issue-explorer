import React from 'react';
import { ISSUE_STATUSES, ISSUE_STATUS_COLORS_RAW } from '../util/constants';

const OrphanStatusModal = ({ 
  show, 
  onClose, 
  orphanStatusCounts, 
  totalStatusCounts 
}) => {
  if (!show) return null;

  // Calculate total orphaned and total issues
  const totalOrphanedIssues = orphanStatusCounts.reduce((sum, item) => sum + item.count, 0);
  const totalIssues = Object.values(totalStatusCounts).reduce((sum, count) => sum + count, 0);

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
        maxWidth: '600px',
        width: '80%'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <h2 style={{ margin: 0 }}>Orphaned Issues by Status</h2>
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
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {orphanStatusCounts.map(item => {
            const totalForStatus = totalStatusCounts[item.status] || 0;
            const percentage = totalForStatus > 0 ?
              Math.round((item.count / totalForStatus) * 100) : 0;
              
            return (
              <div 
                key={item.status} 
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px',
                  backgroundColor: ISSUE_STATUS_COLORS_RAW[item.status] || '#ccc',
                  borderRadius: '4px'
                }}
              >
                <span style={{ fontWeight: 'bold' }}>
                  {ISSUE_STATUSES[item.status] || `Status ${item.status}`}
                </span>
                <span>
                  {item.count} of {totalForStatus} issues ({percentage}%)
                </span>
              </div>
            );
          })}

          <div style={{ 
            marginTop: '10px', 
            fontWeight: 'bold', 
            textAlign: 'right' 
          }}>
            Total orphaned issues: {totalOrphanedIssues} of {totalIssues} ({Math.round((totalOrphanedIssues / totalIssues) * 100)}%)
          </div>
        </div>
      </div>
    </>
  );
};

export default OrphanStatusModal;
