"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { useRouter } from "next/navigation";

const AdminDashboard = ({ user, sendSection, currentDate }) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef(null);
  const [tasksData, setTasksData] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const router = useRouter();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true); // Start loading
        const res = await fetch("/api/tasks", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch tasks");
        }

        const data = await res.json();
        setTasksData(data.tasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        alert("Failed to fetch tasks. Please try again later.");
      } finally {
        setIsLoading(false); // End loading
      }
    };

    fetchTasks();
  }, []);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  // Ensure tasksData is always an array
  const totalTasks = Array.isArray(tasksData) ? tasksData.length : 0;
  const pendingTasks = Array.isArray(tasksData)
    ? tasksData.filter((task) => task.status === "Pending").length
    : 0;
  const inProgressTasks = Array.isArray(tasksData)
    ? tasksData.filter((task) => task.status === "In Progress").length
    : 0;
  const completedTasks = Array.isArray(tasksData)
    ? tasksData.filter((task) => task.status === "Completed").length
    : 0;

  const lowPriority = Array.isArray(tasksData)
    ? tasksData.filter((task) => task.priority === "Low Priority").length
    : 0;
  const mediumPriority = Array.isArray(tasksData)
    ? tasksData.filter((task) => task.priority === "Medium Priority").length
    : 0;
  const highPriority = Array.isArray(tasksData)
    ? tasksData.filter((task) => task.priority === "High Priority").length
    : 0;

  const pieData = [
    { name: "Pending", value: pendingTasks, color: "#8B5CF6" },
    { name: "In Progress", value: inProgressTasks, color: "#06B6D4" },
    { name: "Completed", value: completedTasks, color: "#10B981" },
  ];

  const barData = [
    { name: "Low Priority", value: lowPriority, color: "#10B981" },
    { name: "Medium Priority", value: mediumPriority, color: "#F59E0B" },
    { name: "High Priority", value: highPriority, color: "#EF4444" },
  ];

  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "Pending":
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case "In Progress":
        return `${baseClasses} bg-cyan-100 text-cyan-800`;
      case "Completed":
        return `${baseClasses} bg-green-100 text-green-800`;
      default:
        return baseClasses;
    }
  };

  const getPriorityBadge = (priority) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
    switch (priority) {
      case "Low Priority":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "Medium Priority":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "High Priority":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return baseClasses;
    }
  };

  const formattedDate = new Date(currentDate).toLocaleDateString();

  // Ensure tasksData is always an array before calling slice
  const recentTasks = Array.isArray(tasksData) ? tasksData.slice(0, 8) : [];

  return (
    <div className="w-full relative" ref={containerRef}>
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <style jsx>{`
            .loader {
              width: 48px;
              height: 48px;
              border: 5px solid #FFF;
              border-bottom-color: #1E88E5;
              border-radius: 50%;
              display: inline-block;
              box-sizing: border-box;
              animation: rotation 1s linear infinite;
            }
            @keyframes rotation {
              0% {
                transform: rotate(0deg);
              }
              100% {
                transform: rotate(360deg);
              }
            }
          `}</style>
          <span className="loader"></span>
        </div>
      )}

      <div className={`max-w-7xl mx-auto ${isLoading ? 'blur-sm' : ''}`}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {`Good Morning! ${user?.name || ''}`}
          </h1>
          <p className="text-gray-500">{formattedDate}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {[
            { label: "Total Tasks", value: totalTasks, color: "bg-blue-500" },
            { label: "Pending Tasks", value: pendingTasks, color: "bg-purple-500" },
            { label: "In Progress", value: inProgressTasks, color: "bg-cyan-500" },
            { label: "Completed Tasks", value: completedTasks, color: "bg-green-500" },
          ].map((card, i) => (
            <div key={i} className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
              <div className="flex items-center">
                <div className={`w-3 h-8 ${card.color} rounded-full mr-3`}></div>
                <div>
                  <p className="text-xl md:text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-gray-500 text-xs md:text-sm">{card.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8">
          {/* Task Distribution Chart */}
          <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4 md:mb-6">
              Task Distribution
            </h3>
            <div className="flex items-center justify-center">
              {containerWidth > 0 && (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="flex justify-center mt-4 space-x-4 md:space-x-6">
              {pieData.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-xs md:text-sm text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Priority Levels Chart */}
          <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4 md:mb-6">
              Task Priority Levels
            </h3>
            {containerWidth > 0 && (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={barData}
                  margin={{ top: 20, right: 20, left: 20, bottom: 5 }}
                >
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Tasks Section */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-200">
            <h3 className="text-base md:text-lg font-semibold text-gray-900">Recent Tasks</h3>
            <button className="flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm cursor-pointer"
              onClick={() => sendSection("seeAllTasks")}
            >
              See All
              <svg
                className="w-4 h-4 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Created On
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 truncate max-w-[200px] md:max-w-none">
                        {task.title || "N/A"}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(task.status)}>
                        {task.status || "N/A"}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <span className={getPriorityBadge(task.priority)}>
                        {task.priority || "N/A"}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                      {new Date(task.createdAt).toLocaleDateString() || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;