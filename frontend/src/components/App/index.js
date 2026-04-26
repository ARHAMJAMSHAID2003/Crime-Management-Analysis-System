import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import OfficerLogin from "../Auth/OfficerLogin";
import VictimWitnessLogin from "../Auth/VictimWitnessLogin";
import OfficerDashboard from "../Dashboard/OfficerDashboard";
import CrimeReports from "../Reports/CrimeReports";
import VictimProfile from "../Reports/VictimProfile";
import WitnessCrimes from "../Reports/WitnessCrimes";
import WitnessProfile from "../Reports/WitnessProfile";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');
    
    if (token && userRole) {
      setIsAuthenticated(true);
      setRole(userRole);
    }
    
    setLoading(false);
  }, []);

  // Protected Route Component
  const ProtectedRoute = ({ children, requiredRole }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login/officer" replace />;
    }
    
    if (requiredRole && role !== requiredRole) {
      return <Navigate to="/dashboard" replace />;
    }
    
    return children;
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login/officer" 
          element={
            isAuthenticated && role === 'OFFICER' ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <OfficerLogin setIsAuthenticated={setIsAuthenticated} setRole={setRole} />
            )
          } 
        />
        <Route 
          path="/login/victim" 
          element={
            isAuthenticated && role === 'VICTIM' ? (
              <Navigate to="/reports" replace />
            ) : isAuthenticated && role === 'WITNESS' ? (
              <Navigate to="/witness-cases" replace />
            ) : (
              <VictimWitnessLogin setIsAuthenticated={setIsAuthenticated} setRole={setRole} />
            )
          } 
        />
        
        {/* Default login redirect */}
        <Route path="/login" element={<Navigate to="/login/officer" replace />} />
        
        {/* Protected Routes - Officer */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute requiredRole="OFFICER">
              <OfficerDashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Protected Routes - Victim */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute requiredRole="VICTIM">
              <CrimeReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute requiredRole="VICTIM">
              <VictimProfile />
            </ProtectedRoute>
          }
        />
        
        {/* Protected Routes - Witness */}
        <Route
          path="/witness-cases"
          element={
            <ProtectedRoute requiredRole="WITNESS">
              <WitnessCrimes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/witness-profile"
          element={
            <ProtectedRoute requiredRole="WITNESS">
              <WitnessProfile />
            </ProtectedRoute>
          }
        />
        
        {/* Default route */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              role === 'OFFICER' ? (
                <Navigate to="/dashboard" replace />
              ) : role === 'VICTIM' ? (
                <Navigate to="/reports" replace />
              ) : role === 'WITNESS' ? (
                <Navigate to="/witness-cases" replace />
              ) : (
                <Navigate to="/login/officer" replace />
              )
            ) : (
              <Navigate to="/login/officer" replace />
            )
          } 
        />
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
