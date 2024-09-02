import './App.css';
import Footer from './Components/Footer/Footer';
import Navbar from './Components/Navbar/Navbar';
import Shorting from './Components/Shorting/Shorting';
import Pools from './Components/Pools/Pools';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Components/Home/Home';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/pools" element={<Pools />} />
        <Route path="/shorting" element={<Shorting />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
