import './App.css';
import CovidData from "./containers/CovidData";
import DetailedState  from './containers/DetailedState';
import { BrowserRouter as Router, Route, Routes  } from 'react-router-dom';

function App() {
  return (
    <div>
      {/* Routing Navigation */}
      <Router>
        <Routes>
          <Route path="/" element={<CovidData />}/>
          <Route path="/detailed-view" element={<DetailedState />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
