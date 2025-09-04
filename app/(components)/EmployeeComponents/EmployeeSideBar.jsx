"use client";
import React from "react";

const EmployeeSideBar = ({ user, sendSection, sidebarOpen, setSidebarOpen }) => {
  return (
    <div>
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="p-6">
          {/* User Profile */}
          <div className="flex items-center mb-8">
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"}
              alt="User"
              className="w-10 h-10 rounded-full mr-3"
            />
            <div>
              <h3 className="font-semibold text-gray-900">{user?.name || '...'}</h3>
              <p className="text-sm text-gray-500">{user?.email || ''}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {[
              { name: "Dashboard", key: "dashboard", icon: "📊" },
              { name: "Manage Tasks", key: "manageTasks", icon: "📋" },
              { name: "Logout", key: "logout", icon: "🚪" },
            ].map((item) => (
              <a
                key={item.key}
                href="#"
                className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                onClick={() => sendSection(item.key)}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default EmployeeSideBar;
