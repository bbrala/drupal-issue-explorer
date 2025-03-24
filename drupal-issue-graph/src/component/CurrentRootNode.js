// src/component/CurrentRootNode.js
import React from 'react';

function CurrentRootNode({ rootNodeId, nodes }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      padding: '5px 10px',
      marginLeft: '10px',
      borderLeft: '1px solid #ddd',
      overflow: 'hidden'
    }}>
      <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#555' }}>
        Current Root Node
      </span>
      <span style={{
        fontSize: '14px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}>
      {(() => {
        const rootNode = nodes.find(node => node.nid === rootNodeId);
        return rootNode ?
          `${rootNode.displayTitle}` :
          `#${rootNodeId}`;
      })()}
      </span>
    </div>
  );
}

export default CurrentRootNode;
