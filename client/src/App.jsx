import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Callback from './pages/Callback';
import Profile from './pages/Profile';
import ProfileSetup from './pages/ProfileSetup';
import User from './pages/User';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/setup" element={<ProfileSetup />} />
          <Route path="/user" element={<User />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App