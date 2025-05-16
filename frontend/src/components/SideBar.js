import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/sidebar.css';

const Sidebar = ({ isLoggedIn }) => {
  if (!isLoggedIn) return null;

  return (
    <div className="sidebar">

      <Link to="/myposts" className="sidebar-link">
        <i className="fas fa-file-alt"></i> 
        My Posts
      </Link>
      <Link to="/saved" className="sidebar-link">
        <i className="fas fa-bookmark"></i> 
        Saved Questions
      </Link>
      {/* <Link to="/topics" className="sidebar-link">
        <i className="fas fa-tags"></i> 
        Topics
      </Link> */}
    </div>
  );
};

export default Sidebar;
