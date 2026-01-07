import { Suspense, lazy } from 'react';
import {
    Navigate,
    Route,
    BrowserRouter as Router,
    Routes,
} from 'react-router-dom';
import './App.css';
import LoadingSpinner from './components/LoadingSpinner';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

// Lazy load components
const Home = lazy(() => import('./pages/Home'));
const Contact = lazy(() => import('./pages/Contact'));
const Quiz = lazy(() => import('./pages/Quiz'));
const Gallery = lazy(() => import('./pages/Gallery'));
const AdminLogin = lazy(() => import('./pages/admin/Login'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const DashboardHome = lazy(() => import('./components/admin/DashboardHome'));
const AdminUnauthorized = lazy(() => import('./pages/admin/Unauthorized'));
const ReservationsManager = lazy(
  () => import('./pages/admin/ReservationsManager')
);
const ContentEditor = lazy(() => import('./components/admin/ContentEditor'));
const ShoppingLists = lazy(() => import('./pages/admin/ShoppingLists'));
const GalleryManager = lazy(() => import('./pages/admin/GalleryManager'));
const Customers = lazy(() => import('./pages/admin/Customers'));
const Analytics = lazy(() => import('./pages/admin/Analytics'));
const Settings = lazy(() => import('./pages/admin/Settings'));
const EmailSettings = lazy(() => import('./components/admin/EmailSettings'));
const CalculatorSettings = lazy(() => import('./components/admin/CalculatorSettings'));
const SystemHealth = lazy(() => import('./pages/admin/SystemHealth'));
const GhostDashboard = lazy(() => import('./pages/admin/GhostDashboard'));



function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/gallery" element={<Gallery />} />

          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/unauthorized" element={<AdminUnauthorized />} />

          {/* Protected admin routes with nested routing */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardHome />} />
            <Route
              path="reservations"
              element={
                <ProtectedRoute requiredRole="admin">
                  <ReservationsManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="content"
              element={
                <ProtectedRoute requiredRole="editor">
                  <ContentEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="shopping-lists"
              element={
                <ProtectedRoute requiredRole="admin">
                  <ShoppingLists />
                </ProtectedRoute>
              }
            />
            <Route
              path="gallery"
              element={
                <ProtectedRoute requiredRole="editor">
                  <GalleryManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="customers"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Customers />
                </ProtectedRoute>
              }
            />
            <Route
              path="analytics"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="settings"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="email"
              element={
                <ProtectedRoute requiredRole="admin">
                  <EmailSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="calculator"
              element={
                <ProtectedRoute requiredRole="admin">
                  <CalculatorSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="health"
              element={
                <ProtectedRoute requiredRole="admin">
                  <SystemHealth />
                </ProtectedRoute>
              }
            />
            <Route
              path="ghost"
              element={
                <ProtectedRoute requiredRole="admin">
                  <GhostDashboard />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;






