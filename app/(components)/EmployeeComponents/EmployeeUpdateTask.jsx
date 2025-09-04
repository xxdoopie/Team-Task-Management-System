"use client"
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, User, ExternalLink } from 'lucide-react';

const EmployeeUpdateTask = ({ task, onBack, onSave }) => {
  const [todoItems, setTodoItems] = useState([]);
  const [status, setStatus] = useState(task.status);
  const [completionPercentage, setCompletionPercentage] = useState(task.completionPercentage || 0);

  // Initialize todo items with proper IDs
  useEffect(() => {
    if (task.todoItems && task.todoItems.length > 0) {
      const itemsWithIds = task.todoItems.map((item, index) => ({
        id: item._id || `todo-${index}`, // Use MongoDB _id if available, fallback to index-based ID
        text: item.text,
        completed: item.completed || false,
        completedAt: item.completedAt
      }));
      setTodoItems(itemsWithIds);
    } else {
      setTodoItems([]);
    }
  }, [task.todoItems]);

  // Calculate status and completion percentage based on todo completion
  useEffect(() => {
    if (todoItems.length > 0) {
      const completedCount = todoItems.filter(item => item.completed).length;
      const totalCount = todoItems.length;
      const percentage = Math.round((completedCount / totalCount) * 100);
      
      setCompletionPercentage(percentage);
      
      if (percentage === 0) {
        setStatus('Pending');
      } else if (percentage === 100) {
        setStatus('Completed');
      } else {
        setStatus('In Progress');
      }
    } else {
      setCompletionPercentage(0);
      setStatus('Pending');
    }
  }, [todoItems]);

  const handleTodoToggle = (todoId) => {
    setTodoItems(prev => prev.map(item => 
      item.id === todoId 
        ? { 
            ...item, 
            completed: !item.completed,
            completedAt: !item.completed ? new Date() : null
          } 
        : item
    ));
  };

  const handleSave = () => {
    // Create a clean copy of the task data without mutating the original
    const updatedTask = {
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate,
      startDate: task.startDate,
      assignedTo: task.assignedTo,
      createdBy: task.createdBy,
      estimatedHours: task.estimatedHours,
      actualHours: task.actualHours,
      tags: task.tags,
      comments: task.comments,
      attachments: task.attachments,
      todoItems: todoItems.map(item => ({
        text: item.text,
        completed: item.completed,
        completedAt: item.completed ? (item.completedAt || new Date()) : null
      })),
      status,
      completionPercentage,
      updatedAt: new Date()
    };

    onSave(task._id || task.id, updatedTask);
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Tasks
          </button>
        </div>

        {/* Task Header with Status */}
        <div className="bg-white rounded-lg p-8 shadow-sm mb-8">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
              {status}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm font-medium text-gray-700">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
            <p className="text-gray-700 leading-relaxed">{task.description}</p>
          </div>

          {/* Task Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Priority */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Priority</h4>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(task.priority)}`}>
                {task.priority.replace(' Priority', '')}
              </span>
            </div>

            {/* Due Date */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Due Date</h4>
              <div className="flex items-center gap-2 text-gray-900">
                <Calendar size={16} />
                <span className="font-medium">{new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Assigned To */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Assigned To</h4>
              <div className="flex items-center gap-3">
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
              </div>
            </div>
          </div>
        </div>

        {/* Todo Checklist */}
        <div className="bg-white rounded-lg p-8 shadow-sm mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Todo Checklist</h3>
          
          <div className="space-y-4">
            {todoItems.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No checklist items available for this task.</p>
            ) : (
              todoItems.map((item, index) => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-sm font-medium text-gray-500 w-8">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => handleTodoToggle(item.id)}
                    className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className={`flex-1 ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'} text-lg`}>
                    {item.text}
                  </span>
                  {item.completed && item.completedAt && (
                    <span className="text-xs text-gray-400">
                      Completed: {new Date(item.completedAt).toLocaleString()}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Attachments */}
        {task.attachments && task.attachments.length > 0 && (
          <div className="bg-white rounded-lg p-8 shadow-sm mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Attachments</h3>
            
            <div className="space-y-3">
              {task.attachments.map((attachment, index) => (
                <div key={attachment._id || index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-sm font-medium text-gray-500 w-8">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="flex items-center flex-1">
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline text-lg flex items-center gap-2"
                    >
                      {attachment.name}
                      <ExternalLink size={16} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg cursor-pointer"
          >
            Save Progress
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeUpdateTask;