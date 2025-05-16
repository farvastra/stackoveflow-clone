import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import AuthPage from './components/AuthPage';
import HomePage from './components/HomePage';
import AskQuestionPage from './components/AskQuestionPage';
import QuestionDetailPage from './components/QuestionDetailPage';
import MyPosts from './components/MyPosts';
import NavBar from './components/NavBar';
import SavedQuestionsPage from './components/SavedQuestionsPage';
import Sidebar from './components/SideBar';
import "./App.css"

function App() {
  const [user, setUser] = useState(null); 
  const [authLoading, setAuthLoading] = useState(true); 

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAuthLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const expirationTime = decoded.exp * 1000 - Date.now();

      if (expirationTime > 0) {
        setTimeout(() => {
          handleLogout();
          alert("Session expired. Please log in again.");
        }, expirationTime);
      } else {
        handleLogout();
        return;
      }
    } catch (err) {
      console.error("Invalid token");
      localStorage.removeItem('token');
    }

    fetch('http://localhost:5000/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        "Content-Type": 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => {
        setUser(data.user);
        setAuthLoading(false); 
      })
      .catch(() => {
        localStorage.removeItem('token');
        setAuthLoading(false); 
      });
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null); 
  };

  const ProtectedRoute = ({ element }) => {
    if (authLoading) return <div>Loading...</div>;
    return user ? element : <Navigate to="/auth?mode=login" />;
  };

  const MainLayout = ({ children }) => (
    <div className="app-layout">
      {user && <Sidebar isLoggedIn={!!user} />}
      <div className="main-content">
        {children}
      </div>
    </div>
  );

  return (
    <Router>
      <NavBar user={user} onLogout={handleLogout} />
      <MainLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/questions/:id" element={<QuestionDetailPage />} />
          <Route path="/ask" element={<ProtectedRoute element={<AskQuestionPage user={user} />} />} />
          <Route path="/auth" element={<AuthPage key={window.location.search} />} />
          <Route path="/myposts" element={<ProtectedRoute element={<MyPosts user={user} />} />} />
          <Route path="/saved" element={<ProtectedRoute element={<SavedQuestionsPage userId={user?.id} />} />} />

        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
