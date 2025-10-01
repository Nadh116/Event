import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/public/Home';
import Events from './pages/public/Events';
import EventDetails from './pages/public/EventDetails';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Dashboard from './pages/admin/Dashboard';
import EventForm from './pages/admin/EventForm';
import Attendees from './pages/admin/Attendees';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetails />} />

          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/signup" element={<Signup />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events/new"
            element={
              <ProtectedRoute>
                <EventForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events/:id/edit"
            element={
              <ProtectedRoute>
                <EventForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events/:id/attendees"
            element={
              <ProtectedRoute>
                <Attendees />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
