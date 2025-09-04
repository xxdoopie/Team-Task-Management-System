"use client";
import React, { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  User,
  Trash2,
  Plus,
  ExternalLink,
} from "lucide-react";

// Fixing hydration mismatch by ensuring consistent date formatting
const formatDate = (date) => {
  if (!date) return "No due date";
  const options = { year: "numeric", month: "2-digit", day: "2-digit" };
  return new Date(date).toLocaleDateString("en-GB", options); // DD/MM/YYYY
};

const UpdateTask = ({ task, onBack, onSave, onDelete }) => {
  // Ensure `assignedTo` is always an array to avoid runtime errors
  const [formData, setFormData] = useState({
    title: task.title || "",
    description: task.description || "",
    priority: task.priority || "Medium Priority",
    status: task.status || "Pending",
    dueDate: task.dueDate || "",
    assignedTo: task.assignedTo || [], // Default to empty array if undefined
  });

  // Checklist & attachments
  const [todoItems, setTodoItems] = useState(task.todoItems || []);
  const [attachments, setAttachments] = useState(task.attachments || []);

  // New checklist & attachment inputs
  const [newTodoItem, setNewTodoItem] = useState("");
  const [attachmentType, setAttachmentType] = useState("link");
  const [attachmentValue, setAttachmentValue] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [attachmentFile, setAttachmentFile] = useState(null);

  // Ensure `avatars` is always safe
  const avatars = task.avatars || [];

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Checklist toggle
  const handleTodoToggle = (todoId) => {
    setTodoItems((prev) =>
      prev.map((item) =>
        item._id === todoId
          ? { ...item, completed: !item.completed }
          : { ...item }
      )
    );
  };

  // Add new checklist item
  const addTodoItem = () => {
    if (newTodoItem.trim()) {
      const newItem = {
        _id: new Date().getTime().toString(), // temporary id for UI
        text: newTodoItem.trim(),
        completed: false,
      };
      setTodoItems((prev) => [...prev, newItem]);
      setNewTodoItem("");
    }
  };

  // Delete checklist item
  const deleteTodoItem = (todoId) => {
    setTodoItems((prev) => prev.filter((item) => item._id !== todoId));
  };

  // Add new attachment
  const addAttachment = () => {
    if (attachmentType === "link" && attachmentValue.trim()) {
      const newAttachment = {
        id: Date.now(),
        type: "link",
        value: attachmentValue.trim(),
        name: attachmentName || attachmentValue.trim(),
        url: attachmentValue.trim(),
      };
      setAttachments((prev) => [...prev, newAttachment]);
      setAttachmentValue("");
      setAttachmentName("");
    } else if (attachmentType === "file" && attachmentFile) {
      const newAttachment = {
        id: Date.now(),
        type: "file",
        value: attachmentFile,
        name: attachmentName || attachmentFile.name,
        url: URL.createObjectURL(attachmentFile),
      };
      setAttachments((prev) => [...prev, newAttachment]);
      setAttachmentFile(null);
      setAttachmentName("");
    }
  };

  // Delete attachment
  const deleteAttachment = (attachmentId) => {
    setAttachments((prev) => prev.filter((item) => item.id !== attachmentId));
  };

  // Ensure taskScore is updated based on completed todoItems
  const handleSave = () => {
    const completedTodos = todoItems.filter((item) => item.completed).length;
    const updatedTask = {
      ...task,
      ...formData,
      todoItems,
      attachments,
      taskScore: `${completedTodos}/${todoItems.length}`,
    };

    // Save progress to the backend
    fetch(`/api/tasks/${task._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedTask),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to save task progress");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Task updated successfully", data);
        onSave(updatedTask);
      })
      .catch((error) => {
        console.error("Error saving task progress:", error);
        alert("Failed to save task progress. Please try again.");
      });
  };

  // Delete task
  const handleDelete = () => {
    if (!task || !task._id) {
      console.error("Invalid task object. Cannot delete task.");
      return;
    }
    onDelete(task._id);
  };

  // Priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High Priority":
        return "border-red-200 bg-red-50";
      case "Medium Priority":
        return "border-yellow-200 bg-yellow-50";
      case "Low Priority":
        return "border-green-200 bg-green-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  // Status color
  const getStatusColor = (status) => {
    switch (status) {
      case "In Progress":
        return "text-cyan-700 bg-cyan-100";
      case "Pending":
        return "text-purple-700 bg-purple-100";
      case "Completed":
        return "text-green-700 bg-green-100";
      default:
        return "text-gray-700 bg-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Tasks
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Update Task</h1>
          </div>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 cursor-pointer bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter task title"
              />
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Enter task description"
              />
            </div>

            {/* Priority, Status, Date */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="High Priority">High Priority</option>
                    <option value="Medium Priority">Medium Priority</option>
                    <option value="Low Priority">Low Priority</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="text"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="DD/MM/YYYY"
                  />
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                TODO Checklist
              </h3>

              {/* Add new item */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newTodoItem}
                  onChange={(e) => setNewTodoItem(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter new task..."
                  onKeyPress={(e) => e.key === "Enter" && addTodoItem()}
                />
                <button
                  onClick={addTodoItem}
                  className="flex items-center cursor-pointer gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>

              {/* Items list */}
              <div className="space-y-2">
                {todoItems.map((item, index) => (
                  <div
                    key={item._id || index}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm font-medium text-gray-500 w-8">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => handleTodoToggle(item._id)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span
                      className={`flex-1 ${
                        item.completed
                          ? "line-through text-gray-500"
                          : "text-gray-900"
                      }`}
                    >
                      {item.text}
                    </span>
                    <button
                      onClick={() => deleteTodoItem(item._id)}
                      className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Attachments */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Attachment
              </h3>

              {/* Type toggle */}
              <div className="flex gap-4 mb-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="attachmentType"
                    value="link"
                    checked={attachmentType === "link"}
                    onChange={() => setAttachmentType("link")}
                    className="mr-2"
                  />
                  Link
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="attachmentType"
                    value="file"
                    checked={attachmentType === "file"}
                    onChange={() => setAttachmentType("file")}
                    className="mr-2"
                  />
                  File
                </label>
              </div>

              {/* Input field */}
              {attachmentType === "link" ? (
                <input
                  type="text"
                  value={attachmentValue}
                  onChange={(e) => setAttachmentValue(e.target.value)}
                  placeholder="Enter URL"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                />
              ) : (
                <input
                  type="file"
                  onChange={(e) => {
                    setAttachmentFile(e.target.files[0]);
                    setAttachmentName(e.target.files[0]?.name || "");
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 hover:cursor-pointer hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}

              <button
                type="button"
                onClick={addAttachment}
                className="px-4 py-2 cursor-pointer bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Attachment
              </button>

              {/* Attachments list */}
              {attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                  {attachments.map((attachment, index) => (
                    <div
                      key={attachment.id || index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-500 w-8">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div className="flex items-center">
                          {attachment.type === "link" || attachment.url ? (
                            <a
                              href={attachment.url || attachment.value}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline"
                            >
                              {attachment.name}
                            </a>
                          ) : (
                            <span className="text-gray-900">
                              {attachment.name}
                            </span>
                          )}
                          {(attachment.type === "link" || attachment.url) && (
                            <ExternalLink
                              size={16}
                              className="ml-2 text-blue-600"
                            />
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteAttachment(attachment.id)}
                        className="text-red-500 hover:text-red-700 p-1 "
                      >
                        <Trash2 size={16}
                        className="cursor-pointer"
                        />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status card */}
            <div
              className={`rounded-lg p-4 border-2 ${getPriorityColor(
                formData.priority
              )}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    formData.status
                  )}`}
                >
                  {formData.status}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {todoItems.filter((item) => item.completed).length}/
                  {todoItems.length} Complete
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {formData.title}
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  Due: {formatDate(formData.dueDate)}
                </div>
                <div className="flex items-center gap-2">
                  <User size={14} />
                  {formData.assignedTo.length} team member
                  {formData.assignedTo.length !== 1 ? "s" : ""}
                </div>
              </div>
            </div>

            {/* Assigned team */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-3">Assigned To</h4>
              <div className="space-y-2">
                {formData.assignedTo.map((member) => (
                  <div key={member._id} className="flex items-center gap-3">
                    <img
                      src={
                        member.avatar ||
                        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
                      }
                      alt={member.name}
                      className="w-8 h-8 rounded-full"
                    />

                    <span className="text-sm text-gray-700">{member.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              className="w-full cursor-pointer bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateTask;