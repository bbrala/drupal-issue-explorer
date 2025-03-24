// Add this new component at the end of the file

import React from 'react';

const SearchBar = ({ searchTerm, searchResults, handleSearchChange, selectSearchResult }) => (
  <div style={{ position: 'relative'}}>
    <label
      htmlFor="search-issues"
      style={{
        display: 'block',
        fontSize: '10px',
        fontWeight: 'bold',
        marginBottom: '4px',
        color: '#555'
      }}
    >
      Search issues
    </label>
    <input
      type="text"
      placeholder="Search issues..."
      onChange={handleSearchChange}
      value={searchTerm || ''}
      style={{ padding: '8px', width: '300px' }}
    />
    {searchResults && searchResults.length > 0 && (
      <ul style={{
        display: 'block',
        position: 'absolute',
        top: '100%',
        left: '0',
        width: '600px',
        maxHeight: '300px',
        overflow: 'auto',
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        zIndex: 1000,
        listStyle: 'none', padding: 0, margin: 0
      }}>
        {searchResults.map(node => (
          <li
            key={node.nid}
            onClick={() => selectSearchResult(node.nid)}
            style={{
              textAlign: 'left',
              padding: '8px 12px',
              cursor: 'pointer',
              borderBottom: '1px solid #eee',
              hoverBackgroundColor: '#f5f5f5',
              margin: '2px 0',
              backgroundColor: node.statusText && node.statusText.includes('Closed') ? '#f0f0f0' : '#fff',
              opacity: node.statusText && node.statusText.includes('Closed') ? 0.6 : 1,
              borderLeft: `4px solid ${node.color?.substring(0,7) || '#ccc'}`
            }}
            className={`project-issue-status-${node.statusText}`}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {node.displayTitle}
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default SearchBar;
