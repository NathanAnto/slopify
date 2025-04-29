import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import "date-fns"
import Map from './pages/Map';
import Events from './pages/Events';
import MyEvents from './pages/MyEvents';
import ResponsiveAppBar from './ResponsiveAppBar';

function App() {
  return (
    <Router>
      <ResponsiveAppBar />
      <Routes>
        <Route path="/map" element={<Map />} />
        <Route path="/events" element={<Events />} />
        <Route path="/my-events" element={<MyEvents />} />
      </Routes>
    </Router>
  )
}

export default App