import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as neo4j from  'neo4j-driver';

console.log(process.env);
const driver = neo4j.driver(
process.env.REACT_APP_NEO4J_URI || 'bolt://' + process.env.REACT_APP_DDEV_HOSTNAME + ':7687',
  neo4j.auth.basic(
    process.env.REACT_APP_NEO4J_USER || '',
    process.env.REACT_APP_NEO4J_PASSWORD || ''
  ),
  {
    trust: 'TRUST_ALL_CERTIFICATES',
    encrypted: 'ENCRYPTION_ON'
  }
)

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App driver={driver}/>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
