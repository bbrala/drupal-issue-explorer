import React from 'react';

function MaxDistanceInput({ maxDistance, onChange }) {
  return (
    <div style={{ position: 'relative' }}>
      <label
        htmlFor="maxdistance-input"
        style={{
          display: 'block',
          fontSize: '10px',
          fontWeight: 'bold',
          marginBottom: '4px',
          color: '#555'
        }}
      >
        Hops
      </label>
      <input
        id="maxdistance-input"
        type="number"
        value={maxDistance}
        onChange={onChange}
        style={{ padding: '8px', width: '50px' }}
      />
    </div>
  );
}

export default MaxDistanceInput;
