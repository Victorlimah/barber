import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { isAuthenticated } from './auth/auth'
import ProtectedRoute from './auth/ProtectedRoute'

// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Services from './pages/Services'
import Clients from './pages/Clients'
import ClientsLastVisit from './pages/ClientsLastVisit'
import Barbers from './pages/Barbers'
import NewAppointment from './pages/NewAppointment'
import Inbox from './pages/Inbox'
import More from './pages/More'
import Schedule from './pages/Schedule'

// Root redirect based on auth state
function RootRedirect() {
  return isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/schedule" element={<Schedule />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/services"
          element={
            <ProtectedRoute>
              <Services />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clients"
          element={
            <ProtectedRoute>
              <Clients />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clients/last-visit"
          element={
            <ProtectedRoute>
              <ClientsLastVisit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/barbers"
          element={
            <ProtectedRoute>
              <Barbers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments/new"
          element={
            <ProtectedRoute>
              <NewAppointment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inbox"
          element={
            <ProtectedRoute>
              <Inbox />
            </ProtectedRoute>
          }
        />
        <Route
          path="/more"
          element={
            <ProtectedRoute>
              <More />
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </BrowserRouter>
  )
}
