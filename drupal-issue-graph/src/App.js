import logo from './logo.svg';
import './App.css';
import './issue.css';
import CypherViz from './CypherViz';

function App({driver}) {
  return (
    <div className="App">
      <CypherViz driver={driver}></CypherViz>
    </div>
  );
}

export default App;
