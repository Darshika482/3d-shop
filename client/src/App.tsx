
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ShopView from './pages/ShopView';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ShopView />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}

export default App;
