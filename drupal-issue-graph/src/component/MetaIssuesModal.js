import React, { useState } from 'react';
import { ISSUE_STATUSES, ISSUE_STATUS_COLORS_RAW, PROJECTS } from '../util/constants';

const MetaIssuesModal = ({
  show,
  onClose,
  metaIssues,
  loadIssueById
}) => {
  // State for sorting
  const [sortBy, setSortBy] = useState('changed');
  const [sortDirection, setSortDirection] = useState('desc');

  if (!show) return null;

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

  // Sort the issues based on the selected sort method
  const sortedIssues = [...metaIssues].sort((a, b) => {
    let aValue, bValue;

    switch(sortBy) {
      case 'nid':
        aValue = parseInt(a.nid);
        bValue = parseInt(b.nid);
        break;
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        return sortDirection === 'desc'
          ? bValue.localeCompare(aValue)
          : aValue.localeCompare(bValue);
      case 'project':
        aValue = PROJECTS[a.field_project] || a.field_project || '';
        bValue = PROJECTS[b.field_project] || b.field_project || '';
        return sortDirection === 'desc'
          ? bValue.localeCompare(aValue)
          : aValue.localeCompare(bValue);
      case 'component':
        aValue = a.field_issue_component || '';
        bValue = b.field_issue_component || '';
        return sortDirection === 'desc'
          ? bValue.localeCompare(aValue)
          : aValue.localeCompare(bValue);
      case 'status':
        aValue = ISSUE_STATUSES[a.field_issue_status] || '';
        bValue = ISSUE_STATUSES[b.field_issue_status] || '';
        return sortDirection === 'desc'
          ? bValue.localeCompare(aValue)
          : aValue.localeCompare(bValue);
      case 'created':
        aValue = a.created ? parseInt(a.created) : 0;
        bValue = b.created ? parseInt(b.created) : 0;
        break;
      case 'changed':
      default:
        aValue = a.changed ? parseInt(a.changed) : 0;
        bValue = b.changed ? parseInt(b.changed) : 0;
        break;
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
        maxWidth: '1200px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <h2 style={{ margin: 0 }}>Meta Issues</h2>
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

        <p>Issues with "[meta]" or "[META]" in their titles ({metaIssues.length} total)</p>

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
                cursor: 'pointer',
                width: '80px'
              }}
                onClick={() => handleSortChange('nid')}
              >
                Issue ID {renderSortIndicator('nid')}
              </th>
              <th style={{
                textAlign: 'left',
                padding: '8px 10px',
                borderBottom: '2px solid #ddd',
                cursor: 'pointer'
              }}
                onClick={() => handleSortChange('title')}
              >
                Title {renderSortIndicator('title')}
              </th>
              <th style={{
                textAlign: 'left',
                padding: '8px',
                borderBottom: '2px solid #ddd',
                cursor: 'pointer',
                width: '120px'
              }}
                onClick={() => handleSortChange('project')}
              >
                Project {renderSortIndicator('project')}
              </th>
              <th style={{
                textAlign: 'left',
                padding: '8px',
                borderBottom: '2px solid #ddd',
                cursor: 'pointer',
                width: '120px'
              }}
                onClick={() => handleSortChange('component')}
              >
                Component {renderSortIndicator('component')}
              </th>
              <th style={{
                textAlign: 'left',
                padding: '8px',
                borderBottom: '2px solid #ddd',
                cursor: 'pointer',
                width: '120px'
              }}
                onClick={() => handleSortChange('status')}
              >
                Status {renderSortIndicator('status')}
              </th>
              <th style={{
                textAlign: 'right',
                padding: '8px',
                borderBottom: '2px solid #ddd',
                cursor: 'pointer',
                width: '100px'
              }}
                onClick={() => handleSortChange('created')}
              >
                Created {renderSortIndicator('created')}
              </th>
              <th style={{
                textAlign: 'right',
                padding: '8px',
                borderBottom: '2px solid #ddd',
                cursor: 'pointer',
                width: '100px'
              }}
                onClick={() => handleSortChange('changed')}
              >
                Changed {renderSortIndicator('changed')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedIssues.map((issue, index) => {
              const backgroundColor = index % 2 === 0 ? '#f5f5f5' : '#ffffff';
              const statusColor = ISSUE_STATUS_COLORS_RAW[issue.field_issue_status] || '#ccc';
              const statusText = ISSUE_STATUSES[issue.field_issue_status] || 'Unknown';

              // Format dates
              const created = issue.created ? new Date(issue.created * 1000).toLocaleDateString() : 'Unknown';
              const changed = issue.changed ? new Date(issue.changed * 1000).toLocaleDateString() : 'Unknown';
              const projectName = PROJECTS[issue.field_project] || issue.field_project || 'Unknown';

              return (
                <tr
                  key={issue.nid}
                  style={{
                    backgroundColor,
                    cursor: 'pointer'
                  }}
                  onClick={() => {onClose(); loadIssueById(issue.nid);}}
                >
                  <td style={{
                    padding: '10px',
                    borderBottom: '1px solid #eee',
                    fontWeight: sortBy === 'nid' ? 'bold' : 'normal',
                  }}>
                    {issue.nid}
                  </td>
                  <td style={{
                    padding: '10px',
                    borderBottom: '1px solid #eee',
                    fontWeight: sortBy === 'title' ? 'bold' : 'normal',
                  }}>
                    {issue.title}
                  </td>
                  <td style={{
                    padding: '10px',
                    borderBottom: '1px solid #eee',
                    fontWeight: sortBy === 'project' ? 'bold' : 'normal',
                  }}>
                    {projectName}
                  </td>
                  <td style={{
                    padding: '10px',
                    borderBottom: '1px solid #eee',
                    fontWeight: sortBy === 'component' ? 'bold' : 'normal',
                  }}>
                    {issue.field_issue_component || ''}
                  </td>
                  <td style={{
                    padding: '10px',
                    borderBottom: '1px solid #eee',
                    fontWeight: sortBy === 'status' ? 'bold' : 'normal',
                    backgroundColor: statusColor
                  }}>
                    {statusText}
                  </td>
                  <td style={{
                    textAlign: 'right',
                    padding: '10px',
                    borderBottom: '1px solid #eee',
                    fontWeight: sortBy === 'created' ? 'bold' : 'normal',
                  }}>
                    {created}
                  </td>
                  <td style={{
                    textAlign: 'right',
                    padding: '10px',
                    borderBottom: '1px solid #eee',
                    fontWeight: sortBy === 'changed' ? 'bold' : 'normal',
                  }}>
                    {changed}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default MetaIssuesModal;
