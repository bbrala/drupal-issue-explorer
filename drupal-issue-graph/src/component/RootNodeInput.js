// src/component/RootNodeInput.js
import React from 'react';

function RootNodeInput({ rootNodeId, onChange }) {
  return (
    <div style={{ position: 'relative' }}>
      <label
        htmlFor="rootnode-input"
        style={{
          display: 'block',
          fontSize: '10px',
          fontWeight: 'bold',
          marginBottom: '4px',
          color: '#555'
        }}
      >
        Root Node
      </label>
      <input
        id="rootnode-input"
        type="text"
        name="rootnode"
        value={rootNodeId}
        onChange={onChange}
        style={{ padding: '8px', width: '80px' }}
      />
    </div>
  );
}

export default RootNodeInput;
