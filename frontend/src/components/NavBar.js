

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import '../styles/navbar.css';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    onLogout();
    navigate('/');
  };

  const isLoggedIn = !!localStorage.getItem('token');

return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">
          <img src="/stackoverflow.png" alt="Logo" className="logo" />
        </Link>
      </div>

      <div className="navbar-center">
        <Link to="/" className="navbar-link">Questions</Link>
        <Link to="/tags" className="navbar-link">Tags</Link>
        <Link to="/users" className="navbar-link">Users</Link>
      </div>

      <div className="navbar-right">
        <input type="text" className="navbar-search" placeholder="Search..." />
        
        {isLoggedIn && user ? (
          <>
            <span className="navbar-user">Hello, {user.username || user.email}</span>
            <button className="navbar-auth" onClick={handleLogout}>Log Out</button>
          </>
        ) : (
          <>
            <Link to="/auth?mode=login" className="navbar-auth" id="login">Log In</Link>
            <Link to="/auth?mode=signup" className="navbar-auth" id="sign-up">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;