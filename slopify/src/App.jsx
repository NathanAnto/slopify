import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import "date-fns"
import Map from './pages/Map';
import Events from './pages/Events';
import MyEvents from './pages/MyEvents';
import ResponsiveAppBar from './ResponsiveAppBar';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import { useMe } from "./hooks/useMe";
import UserContext from "./UserContext.jsx";

function App() {
  const { me, isLoading, refetchMe, logout } = useMe();

  // Optional: Show a loading indicator while checking auth status
  if (isLoading) {
    return <div>Loading application...</div>;
  }

  return (
    <UserContext.Provider value={{ me, refetchMe, logout, isLoading }}>
      <Router>
        <ResponsiveAppBar />
        <Routes>
          {me ? (
            <>
              <Route path="/map" element={<Map />} />
              <Route path="/events" element={<Events />} />
              <Route path="/my-events" element={<MyEvents />} />
            </>
          ) : (
            <>
              <Route path="/login" element={!me ? <Login /> : <Navigate to="/map" />} />
              <Route path="/signup" element={!me ? <SignUp /> : <Navigate to="/map" />} />
            </>
          )}
          
          <Route path="*" element={<Navigate to={me ? "/map" : "/login"} />} />
        </Routes>
      </Router>
    </UserContext.Provider>
  )
}

export default App