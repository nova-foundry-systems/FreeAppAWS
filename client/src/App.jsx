import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Callback from './pages/Callback';
import User from './pages/User';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/user" element={<User />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App