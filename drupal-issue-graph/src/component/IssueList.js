import React from 'react';

const IssueList = ({ nodes, onNodeClick, onNodeHover }) => (
  <div style={{ width: '500px', flexShrink: 0, overflow: 'auto', marginLeft: '10px', border: '1px solid #ccc', padding: '10px' }}>
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {nodes.map(node => (
        <li
          key={node.nid}
          onClick={() => onNodeClick(node)}
          onMouseOver={() => onNodeHover(node)}
          onMouseLeave={() => onNodeHover(false)}
          style={{
            cursor: 'pointer',
            padding: '5px',
            margin: '2px 0',
            textAlign: 'left',
            backgroundColor: node.statusText && node.statusText.includes('Closed') ? '#f0f0f0' : '#fff',
            opacity: node.statusText && node.statusText.includes('Closed') ? 0.6 : 1,
            borderLeft: `4px solid ${node.color?.substring(0,7) || '#ccc'}`
          }}
        >
          {node.displayTitle} - ({node.distance} hops))
        </li>
      ))}
    </ul>
  </div>
);

export default IssueList;
