import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AuthPage from './pages/AuthPage';
import ChatPage from './pages/ChatPage';
import AppShell from './components/layout/AppShell';
import { ToastContainer } from './components/ui/Toast';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastContainer />
        <Routes>
          {/* Authentication portal */}
          <Route path="/auth" element={<AuthPage />} />

          {/* Protected dashboard workspace routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<ChatPage />} />
            <Route path="/chat/:projectId" element={<ChatPage />} />
          </Route>

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
