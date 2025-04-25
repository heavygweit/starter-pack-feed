import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-title">Starter Pack Explorer</div>
        <nav>
          <Link to="/">Home</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;