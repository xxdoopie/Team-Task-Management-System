"use client"
import React, { useState, useEffect } from 'react';
import { Download, Users } from 'lucide-react';
import EmployeeUpdateTask from './EmployeeUpdateTask';

const EmployeeMyTasks = () => {
  const [filter, setFilter] = useState('All');
  const [currentView, setCurrentView] = useState('list');
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState([]); // Initialize tasks as an empty array

  // Fetch tasks assigned to the logged-in employee
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${apiUrl}/api/tasks`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!res.ok) {
          throw new Error('Failed to fetch tasks');
        }

        const data = await res.json();
        
        // Normalize tasks to ensure consistent ID field
        const normalizedTasks = data.tasks.map(task => ({
          ...task,
          id: task._id || task.id // Ensure id field exists
        }));
        
        setTasks(normalizedTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, []);

  const updateTaskCompletion = async (taskId, updatedTask) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/api/tasks/${taskId}`, {
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

      const updatedData = await res.json();
      
      // Ensure we're using the correct ID field (_id from MongoDB)
      const taskIdToMatch = taskId;
      const updatedTaskWithId = {
        ...updatedData.task,
        id: updatedData.task._id || updatedData.task.id
      };
      
      setTasks((prev) => prev.map((task) => {
        const currentTaskId = task._id || task.id;
        return currentTaskId === taskIdToMatch ? updatedTaskWithId : task;
      }));
      
      return updatedTaskWithId;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const filteredTasks = filter === 'All' 
    ? tasks 
    : tasks.filter(task => task.status === filter);

  const allCount = tasks.length;
  const pendingCount = tasks.filter(task => task.status === 'Pending').length;
  const inProgressCount = tasks.filter(task => task.status === 'In Progress').length;
  const completedCount = tasks.filter(task => task.status === 'Completed').length;

  const handleTaskClick = (taskId) => {
    const task = tasks.find(t => (t._id || t.id) === taskId);
    if (task) {
      setSelectedTask(task);
      setCurrentView('update');
    }
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedTask(null);
  };

  const handleSaveTask = async (taskId, updatedTask) => {
    try {
      const updatedTaskData = await updateTaskCompletion(taskId, updatedTask);
      alert('Task updated successfully!');
      handleBackToList();
      
      // Refresh tasks to ensure we have the latest data
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/api/tasks`, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (res.ok) {
        const data = await res.json();
        const normalizedTasks = data.tasks.map(task => ({
          ...task,
          id: task._id || task.id
        }));
        setTasks(normalizedTasks);
      }
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to update task. Please try again.');
    }
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(prev => prev.filter(task => task.id !== taskId));
      alert('Task deleted successfully!');
      handleBackToList();
    }
  };

  const downloadReport = () => {
    const headers = ['Task ID', 'Title', 'Description', 'Priority', 'Status', 'Due Date', 'Completion %', 'Assigned To'];
    
    const csvContent = [
      headers.join(','),
      ...tasks.map(task => [
        task.id,
        `"${task.title}"`,
        `"${task.description}"`,
        `"${task.priority}"`,
        `"${task.status}"`,
        `"${task.dueDate}"`,
        `"${task.completionPercentage || 0}%"`,
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

  if (currentView === 'update' && selectedTask) {
    return (
      <EmployeeUpdateTask 
        task={selectedTask}
        onBack={handleBackToList}
        onSave={handleSaveTask} // Pass the correct function signature
        onDelete={handleDeleteTask}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-0 sm:p-6">
      <div className="max-w-7xl mx-auto">
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

        <div className="flex gap-1 mb-8 bg-white p-1 rounded-lg w-fit shadow-sm flex-col w-full sm:flex-row">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <div
              key={task._id || task.id}
              onClick={() => handleTaskClick(task._id || task.id)}
              className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer border hover:border-blue-200"
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {task.title}
              </h3>

              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {task.description}
              </p>

              <div className="mb-4">
                <span className="text-sm font-medium text-gray-700">
                  Task Done: {task.completionPercentage || 0}%
                </span>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${task.completionPercentage || 0}%` }}
                  ></div>
                </div>
              </div>

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

              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {task.assignedTo.map((member, index) => (
                    <img
                      key={index}
                      src={member.avatar}
                      alt={`Team member ${index + 1}`}
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

        {filteredTasks.length === 0 && (
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

export default EmployeeMyTasks;