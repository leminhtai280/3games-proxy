import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../App';

function Navbar() {
  const { user, logout } = useAuth();

  const formatBalance = (balance) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(balance || 0);
  };

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="navbar-brand">
        💰 Wallet Website
      </Link>
      
      <div className="navbar-menu">
        <Link to="/dashboard" className="navbar-link">
          Dashboard
        </Link>
        {user?.role === 'admin' && (
          <Link to="/admin" className="navbar-link">
            Admin Panel
          </Link>
        )}
      </div>

      <div className="navbar-user">
        <span>Xin chào, {user?.username}!</span>
        <span className="balance">
          {formatBalance(user?.balance)}
        </span>
        <button onClick={logout} className="logout-btn">
          Đăng xuất
        </button>
      </div>
    </nav>
  );
}

export default Navbar;