"use client";

import React, { useState, useEffect } from 'react';
import { 
  FiMessageCircle, 
  FiUsers, 
  FiSettings,  
  FiMenu, 
  FiCalendar
} from 'react-icons/fi';

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showTitle, setShowTitle] = useState(true);

  const navItems = [
    { name: 'Admin', href: '/admin/users', icon: <FiUsers /> },
    { name: 'Messages', href: '/admin/messages', icon: <FiMessageCircle /> },
    { name: 'Schedule', href: '/dashboard/schedule', icon: <FiCalendar /> },
    { name: 'Settings', href: '/admin/settings', icon: <FiSettings /> },
  ];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Handle automatic collapse on small screens
  const handleResize = () => {
    if (window.innerWidth < 768) { // Adjust breakpoint as necessary
      setIsCollapsed(true);
    } else {
      setIsCollapsed(false);
    }
  };

  // Manage delayed display of the title
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTitle(!isCollapsed);
    }, 100); // Delay for smoother transition

    return () => clearTimeout(timer);
  }, [isCollapsed]);

  // Set up event listener for window resize
  useEffect(() => {
    handleResize(); // Check size on mount
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize); // Clean up listener
    };
  }, []);

  return (
    <aside className={`flex flex-col bg-blue-800 text-white transition-all ${isCollapsed ? 'w-20' : 'w-64'} p-4`}>
      {/* Sidebar Header */}
      <div className="flex items-center mb-6 space-x-2">
        {/* Toggle Button - Fixed on the left */}
        <button
          onClick={toggleSidebar}
          className="text-white hover:text-blue-400"
        >
          <FiMenu size={24} />
        </button>

        {/* Title */}
        {/* {showTitle && !isCollapsed && (
          <h2 className="text-2xl font-bold">Admin Panel</h2>
        )} */}
      </div>

      {/* Sidebar Navigation */}
      <nav className="flex flex-col space-y-2">
        {navItems.map(({ name, href, icon }) => (
          <a 
            href={href} 
            key={name} 
            className={`flex items-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
          >
            <span className="text-lg">{icon}</span>
            {!isCollapsed && (
              <span className="ml-2">{name}</span>
            )}
          </a>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
