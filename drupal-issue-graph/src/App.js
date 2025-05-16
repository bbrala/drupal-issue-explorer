import React, { useState } from 'react';
import logo from './logo.svg';
import { lazy } from 'react';
import './App.css';
import './issue.css';
const CypherViz = lazy(() => import('./CypherViz'));
const CypherViz3d = lazy(() => import('./CypherViz3d'));

function App({driver}) {
  const [is3dView, setIs3dView] = useState(false);

  const toggleView = () => {
    setIs3dView(!is3dView);
  };

  return (
    <div className="App">
      <div className="visualization-toggle" style={{
        position: 'fixed',
        bottom: '60px',
        left: '10px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.8)',
        padding: '5px 10px',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
      }}>
        <span style={{ marginRight: '10px', fontWeight: 'bold' }}>2D</span>
        <label className="switch">
          <input
            type="checkbox"
            checked={is3dView}
            onChange={toggleView}
          />
          <span className="slider round"></span>
        </label>
        <span style={{ marginLeft: '10px', fontWeight: 'bold' }}>3D</span>
      </div>

      {is3dView ? (
        <CypherViz3d driver={driver} />
      ) : (
        <CypherViz driver={driver} />
      )}
    </div>
  );
}

export default App;
