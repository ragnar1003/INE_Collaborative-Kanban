import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import BoardView from './components/BoardView';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';

// A simple component to protect routes
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/" 
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/board/:boardId" 
              element={
                <PrivateRoute>
                  <BoardView />
                </PrivateRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;