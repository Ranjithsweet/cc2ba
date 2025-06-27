import React from 'react';
import { NavLink } from 'react-router-dom';

function Navbar() {
  const navLinkClass = ({ isActive }) =>
    isActive ? 'text-blue-600 font-bold' : 'text-gray-700';

  return (
    <nav className="bg-white shadow p-4 flex gap-6 items-center justify-between">
      <div className="flex gap-6">
        <NavLink to="/" className={navLinkClass}>Home</NavLink>
        <NavLink to="/aboutus" className={navLinkClass}>About Us</NavLink>
        <NavLink to="/services" className={navLinkClass}>Services</NavLink>
        <NavLink to="/contactus" className={navLinkClass}>Contact Us</NavLink>
      </div>
      <div>
        <NavLink 
          to="/login" 
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Login
        </NavLink>
      </div>
    </nav>
  );
}

export default Navbar;
