import React, { useState } from 'react';
import { LINK_COLOURS } from '../util/constants';

const MostReferencedModal = ({
  show,
  onClose,
  referencedIssues,
  loadIssueById
}) => {
  // State for sorting
  const [sortBy, setSortBy] = useState('total');
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
  const sortedIssues = [...referencedIssues].sort((a, b) => {
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
      case 'RELATED':
        aValue = a.RELATED || 0;
        bValue = b.RELATED || 0;
        break;
      case 'PARENT':
        aValue = a.PARENT || 0;
        bValue = b.PARENT || 0;
        break;
      case 'CHILD':
        aValue = a.CHILD || 0;
        bValue = b.CHILD || 0;
        break;
      case 'MENTIONED':
        aValue = a.MENTIONED || 0;
        bValue = b.MENTIONED || 0;
        break;
      case 'total':
      default:
        aValue = a.total;
        bValue = b.total;
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
        maxWidth: '900px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <h2 style={{ margin: 0 }}>Most Referenced Issues</h2>
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
                textAlign: 'right',
                padding: '8px',
                borderBottom: '2px solid #ddd',
                cursor: 'pointer',
                color: LINK_COLOURS.RELATED.substring(0, 7)
              }}
                onClick={() => handleSortChange('RELATED')}
              >
                Related {renderSortIndicator('RELATED')}
              </th>
              <th style={{
                textAlign: 'right',
                padding: '8px',
                borderBottom: '2px solid #ddd',
                cursor: 'pointer',
                color: LINK_COLOURS.PARENT.substring(0, 7)
              }}
                onClick={() => handleSortChange('PARENT')}
              >
                Parent {renderSortIndicator('PARENT')}
              </th>
              <th style={{
                textAlign: 'right',
                padding: '8px',
                borderBottom: '2px solid #ddd',
                cursor: 'pointer',
                color: LINK_COLOURS.CHILD.substring(0, 7)
              }}
                onClick={() => handleSortChange('CHILD')}
              >
                Child {renderSortIndicator('CHILD')}
              </th>
              <th style={{
                textAlign: 'right',
                padding: '8px',
                borderBottom: '2px solid #ddd',
                cursor: 'pointer',
                color: LINK_COLOURS.MENTIONED.substring(0, 7)
              }}
                onClick={() => handleSortChange('MENTIONED')}
              >
                Mentioned {renderSortIndicator('MENTIONED')}
              </th>
              <th style={{
                textAlign: 'right',
                padding: '8px',
                borderBottom: '2px solid #ddd',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
                onClick={() => handleSortChange('total')}
              >
                Total {renderSortIndicator('total')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedIssues.map((issue, index) => {
              const backgroundColor = index % 2 === 0 ? '#f5f5f5' : '#ffffff';

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
                    textAlign: 'right',
                    padding: '10px',
                    borderBottom: '1px solid #eee',
                    fontWeight: sortBy === 'RELATED' ? 'bold' : 'normal',
                    color: issue.RELATED ? LINK_COLOURS.RELATED.substring(0, 7) : 'inherit'
                  }}>
                    {issue.RELATED || 0}
                  </td>
                  <td style={{
                    textAlign: 'right',
                    padding: '10px',
                    borderBottom: '1px solid #eee',
                    fontWeight: sortBy === 'PARENT' ? 'bold' : 'normal',
                    color: issue.PARENT ? LINK_COLOURS.PARENT.substring(0, 7) : 'inherit'
                  }}>
                    {issue.PARENT || 0}
                  </td>
                  <td style={{
                    textAlign: 'right',
                    padding: '10px',
                    borderBottom: '1px solid #eee',
                    fontWeight: sortBy === 'CHILD' ? 'bold' : 'normal',
                    color: issue.CHILD ? LINK_COLOURS.CHILD.substring(0, 7) : 'inherit'
                  }}>
                    {issue.CHILD || 0}
                  </td>
                  <td style={{
                    textAlign: 'right',
                    padding: '10px',
                    borderBottom: '1px solid #eee',
                    fontWeight: sortBy === 'MENTIONED' ? 'bold' : 'normal',
                    color: issue.MENTIONED ? LINK_COLOURS.MENTIONED.substring(0, 7) : 'inherit'
                  }}>
                    {issue.MENTIONED || 0}
                  </td>
                  <td style={{
                    textAlign: 'right',
                    padding: '10px',
                    borderBottom: '1px solid #eee',
                    fontWeight: 'bold'
                  }}>
                    {issue.total}
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

export default MostReferencedModal;
