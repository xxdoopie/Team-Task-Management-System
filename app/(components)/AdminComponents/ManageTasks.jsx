"use client"
import React, { useState, useEffect } from 'react';
import { Download, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import UpdateTaskPage from './UpdateTaskPage'; // Assuming you have an UpdateTaskPage component

const ManageTasks = () => {
  const [filter, setFilter] = useState('All');
  const [currentView, setCurrentView] = useState('list');
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState([]); // Initialize tasks as an empty array
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const router = useRouter();

  // Fetch tasks from the database
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true); // Start loading
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${apiUrl}/api/tasks`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!res.ok) {
          throw new Error('Failed to fetch tasks');
        }

        const data = await res.json();
        setTasks(data.tasks); // Update tasks state with fetched data
      } catch (error) {
        console.error('Error fetching tasks:', error);
        alert('Failed to fetch tasks. Please try again later.');
      } finally {
        setIsLoading(false); // End loading
      }
    };

    fetchTasks();
  }, []); // Empty dependency array ensures this runs only once

  // Filter tasks based on selected filter
  const filteredTasks = filter === 'All' 
    ? tasks 
    : tasks.filter(task => task.status === filter);

  // Get counts for each status
  const allCount = tasks.length;
  const pendingCount = tasks.filter(task => task.status === 'Pending').length;
  const inProgressCount = tasks.filter(task => task.status === 'In Progress').length;
  const completedCount = tasks.filter(task => task.status === 'Completed').length;

  const handleTaskClick = async (taskId) => {
    const task = tasks.find(t => t._id === taskId);
    if (task) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${apiUrl}/api/tasks/${taskId}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!res.ok) {
          throw new Error('Failed to fetch task details');
        }

        const data = await res.json();
        setSelectedTask(data.task); // Ensure the full task details are passed
        setCurrentView('update');
      } catch (error) {
        console.error('Error fetching task details:', error);
        alert('Failed to fetch task details. Please try again later.');
      }
    }
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedTask(null);
  };

  const handleSaveTask = async (updatedTask) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/api/tasks/${updatedTask._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updatedTask),
      });

      if (!res.ok) {
        throw new Error('Failed to update task');
      }

      const data = await res.json();
      setTasks((prev) => prev.map((task) => (task._id === data.task._id ? data.task : task)));
      alert('Task updated successfully!');
      handleBackToList();
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task. Please try again later.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${apiUrl}/api/tasks/${taskId}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (!res.ok) {
          throw new Error('Failed to delete task');
        }

        setTasks((prev) => prev.filter((task) => task._id !== taskId));
        alert('Task deleted successfully!');
        handleBackToList();
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task. Please try again later.');
      }
    }
  };

  const downloadReport = () => {
    const headers = ['Task ID', 'Title', 'Description', 'Priority', 'Status', 'Due Date', 'Assigned To'];
    
    const csvContent = [
      headers.join(','),
      ...tasks.map(task => [
        task._id,
        `"${task.title}"`,
        `"${task.description}"`,
        `"${task.priority}"`,
        `"${task.status}"`,
        `"${new Date(task.dueDate).toLocaleDateString()}"`,
        `"${task.assignedTo.map(member => member.name).join('; ')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'tasks_report.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High Priority':
        return 'text-red-600 bg-red-50';
      case 'Medium Priority':
        return 'text-yellow-600 bg-yellow-50';
      case 'Low Priority':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress':
        return 'text-cyan-700 bg-cyan-100';
      case 'Pending':
        return 'text-purple-700 bg-purple-100';
      case 'Completed':
        return 'text-green-700 bg-green-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const calculateCompletionPercentage = (todoItems) => {
    if (!todoItems || todoItems.length === 0) return 0;
    const completedCount = todoItems.filter((item) => item.completed).length;
    return Math.round((completedCount / todoItems.length) * 100);
  };

  if (currentView === 'update' && selectedTask) {
    return (
      <UpdateTaskPage 
        task={selectedTask}
        onBack={handleBackToList}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-0 sm:p-6 relative">
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
          <button 
            onClick={downloadReport}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={16} />
            Download Report
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 mb-8 bg-white p-1 rounded-lg shadow-sm flex-col w-full sm:flex-row">
          {[
            { name: 'All', count: allCount },
            { name: 'Pending', count: pendingCount },
            { name: 'In Progress', count: inProgressCount },
            { name: 'Completed', count: completedCount }
          ].map((tab) => (
            <button
              key={tab.name}
              onClick={() => setFilter(tab.name)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                filter === tab.name
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.name}
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                filter === tab.name
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <div
              key={task._id}
              onClick={() => handleTaskClick(task._id)}
              className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer border hover:border-blue-200"
            >
              {/* Status and Priority */}
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>

              {/* Task Title */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {task.title}
              </h3>

              {/* Task Description */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {task.description}
              </p>

              {/* Task Score */}
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-700">
                  Task Completed: {calculateCompletionPercentage(task.todoItems)}%
                </span>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-500">Start Date</span>
                  <p className="text-gray-900 font-medium">{new Date(task.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-gray-500">Due Date</span>
                  <p className="text-gray-900 font-medium">{new Date(task.dueDate).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Assigned Team Members */}
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {task.assignedTo.map((member, index) => (
                    <img
                      key={index}
                      src={member.avatar}
                      alt={member.name}
                      className="w-8 h-8 rounded-full border-2 border-white"
                      title={member.name}
                    />
                  ))}
                </div>
                <div className="flex items-center text-gray-500">
                  <Users size={16} className="mr-1" />
                  <span className="text-sm">{task.assignedTo.length}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTasks.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Users size={48} className="mx-auto" />
            </div>
            <p className="text-gray-500 text-lg">No tasks found for "{filter}" status</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageTasks;