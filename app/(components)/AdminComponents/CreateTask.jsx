"use client";
import React, { useState, useEffect } from "react";
import { Users, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { set } from "mongoose";

const CreateTask = () => {
  const router = useRouter();

  // Task form data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Low Priority",
    dueDate: "",
    assignedMembers: [],
  });

  const [todoItems, setTodoItems] = useState([]);
  const [newTodoItem, setNewTodoItem] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [attachmentType, setAttachmentType] = useState("link");
  const [attachmentValue, setAttachmentValue] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [attachmentFile, setAttachmentFile] = useState(null);

  // Employees for assignment
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);

  // Fetch employees from API with a 5-second timeout
  useEffect(() => {
    const timeout = setTimeout(() => {
      async function fetchEmployees() {
        try {
          const res = await fetch("/api/users", {
            method: "GET",
            credentials: "include",
          });

          if (!res.ok) {
            throw new Error("Failed to fetch employees");
          }

          const data = await res.json();
          setEmployees(data.employees);
          console.log(data.employees);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }

      fetchEmployees();
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  if (loading) {
    return <p>Fetching Active Employees...</p>;
  }
  if (error) return <p>Error: {error}</p>;

  // Handle input change
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Add TODO item
  const addTodoItem = () => {
    if (newTodoItem.trim()) {
      const newItem = {
        id: Date.now(),
        text: newTodoItem.trim(),
        completed: false,
      };
      setTodoItems((prev) => [...prev, newItem]);
      setNewTodoItem("");
    }
  };

  // Remove TODO item
  const removeTodoItem = (id) => {
    setTodoItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Toggle TODO completion
  const toggleTodoItem = (id) => {
    setTodoItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  // Add member
  const addMember = (member) => {
    if (!formData.assignedMembers.find((m) => m._id === member._id)) {
      handleInputChange("assignedMembers", [
        ...formData.assignedMembers,
        member,
      ]);
    }
    setShowMemberDropdown(false);
  };

  // Remove member
  const removeMember = (memberId) => {
    handleInputChange(
      "assignedMembers",
      formData.assignedMembers.filter((m) => m._id !== memberId)
    );
  };

  // Add attachment
  const addAttachment = () => {
    if (attachmentType === "link" && attachmentValue.trim()) {
      setAttachments((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "link",
          value: attachmentValue.trim(),
          name: attachmentName || attachmentValue.trim(),
          url: attachmentValue.trim(), // Ensure `url` is set
        },
      ]);
      setAttachmentValue("");
      setAttachmentName("");
      setAttachmentFile(null);
    } else if (attachmentType === "file" && attachmentFile) {
      setAttachments((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "file",
          value: attachmentFile,
          name: attachmentName || attachmentFile.name,
        },
      ]);
      setAttachmentFile(null);
      setAttachmentName("");
      setAttachmentValue("");
    } else {
      alert("Please provide a valid attachment."); // Add validation feedback
    }
  };

  // Remove attachment
  const removeAttachment = (id) => {
    setAttachments((prev) => prev.filter((att) => att.id !== id));
  };

  // Ensure taskScore is calculated based on completed todoItems
  const handleSubmit = async () => {
    try {
      const completedTodos = todoItems.filter((item) => item.completed).length;
      const taskData = {
        ...formData,
        todoItems,
        attachments,
        createdAt: new Date().toISOString(),
        taskScore: `${completedTodos}/${todoItems.length}`,
      };
      console.log("Submitting taskData:", taskData);
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(taskData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Server Error:", errorData);
        throw new Error(errorData.error || "Failed to create task");
      }

      const data = await res.json();
      console.log("Task created:", data.task);
      alert("Task created successfully!");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Error creating task: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Create Task</h1>
        <div className="px-0 max-w-full sm:max-w-5xl sm:px-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Task Title */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Create App UI"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Describe task"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              />
            </div>

            {/* Priority, Due Date, Assign To */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    handleInputChange("priority", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="Low Priority">Low Priority</option>
                  <option value="Medium Priority">Medium Priority</option>
                  <option value="High Priority">High Priority</option>
                </select>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange("dueDate", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Assign To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign To
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowMemberDropdown(!showMemberDropdown)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg flex items-center justify-between bg-white"
                  >
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-500">Add Members</span>
                    </div>
                    <Plus className="h-4 w-4 text-gray-400" />
                  </button>

                  {/* Dropdown */}
                  {showMemberDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                      {employees.map((member) => (
                        <button
                          key={member._id}
                          type="button"
                          onClick={() => addMember(member)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center"
                        >
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-6 h-6 rounded-full mr-3"
                          />
                          {member.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Members */}
                {formData.assignedMembers.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.assignedMembers.map((member) => (
                      <div
                        key={member._id}
                        className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-4 h-4 rounded-full mr-2"
                        />
                        {member.name}
                        <button
                          type="button"
                          onClick={() => removeMember(member._id)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* TODO Checklist */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                TODO Checklist
              </h3>
              {todoItems.length > 0 && (
                <div className="space-y-2 mb-4">
                  {todoItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center flex-1">
                        <span className="text-gray-400 mr-3 font-medium">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => toggleTodoItem(item.id)}
                          className="mr-3 h-4 w-4 text-blue-600 rounded"
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
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTodoItem(item.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2 flex-col sm:flex-row">
                <input
                  type="text"
                  value={newTodoItem}
                  onChange={(e) => setNewTodoItem(e.target.value)}
                  placeholder="Enter Task"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  onKeyPress={(e) => e.key === "Enter" && addTodoItem()}
                />
                <button
                  type="button"
                  onClick={addTodoItem}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </div>
            </div>

            {/* Attachments */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Attachment
              </h3>
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
              {attachmentType === "link" ? (
                <input
                  type="text"
                  value={attachmentValue}
                  onChange={(e) => setAttachmentValue(e.target.value)}
                  placeholder="Enter URL"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                />
              ) : (
                <input
                  type="file"
                  onChange={(e) => {
                    setAttachmentFile(e.target.files[0]);
                    setAttachmentName(e.target.files[0]?.name || "");
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                />
              )}
              <button
                type="button"
                onClick={addAttachment}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Attachment
              </button>
              {attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center">
                        {att.type === "link" ? (
                          <a
                            href={att.value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >
                            {att.name}
                          </a>
                        ) : (
                          <span className="text-gray-900">{att.name}</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(att.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Create Task Button */}
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-medium"
            >
              CREATE TASK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTask;
