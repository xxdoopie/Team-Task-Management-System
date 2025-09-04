"use client"
import React, { useState, useEffect } from 'react';
import { Download, Search, ChevronDown } from 'lucide-react';

const TeamMembers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await fetch('/api/tasks');
        const data = await response.json();
        if (response.ok) {
          setTeamMembers(data.employees);
        } else {
          console.error('Failed to fetch team members:', data.error);
        }
      } catch (error) {
        console.error('Error fetching team members:', error);
      }
    };

    fetchTeamMembers();
  }, []);

  // Filter team members based on search term
  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort team members
  const sortedMembers = [...filteredMembers].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Download CSV report
  const downloadReport = () => {
    const headers = [
      'Username',
      'Email', 
      'Total Assigned Tasks',
      'Pending Tasks',
      'In Progress Tasks',
      'Completed Tasks'
    ];

    const csvContent = [
      headers.join(','),
      ...teamMembers.map(member => [
        `"${member.name}"`,
        `"${member.email}"`,
        member.totalTasks,
        member.pendingTasks,
        member.inProgressTasks,
        member.completedTasks
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'team_members_report.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex-1 min-w-0 w-full overflow-hidden">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-1">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
          <button 
            onClick={downloadReport}
            className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors text-sm"
          >
            <Download size={14} />
            Download Report
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 items-center mb-8 flex-col sm:flex-row">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg "
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none px-4 py-2 pr-8 border border-gray-300 rounded-lg  bg-white"
              >
                <option value="name">Name</option>
                <option value="pendingTasks">Pending Tasks</option>
                <option value="inProgressTasks">In Progress</option>
                <option value="completedTasks">Completed Tasks</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {/* Team Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedMembers.map((member) => (
            <div key={member.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border">
              {/* Member Header */}
              <div className="flex items-start mb-6">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-12 h-12 rounded-full mr-3 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-base mb-1">{member.name}</h3>
                  <p className="text-gray-500 text-sm truncate">{member.email}</p>
                </div>
              </div>

              {/* Task Statistics */}
              <div className="space-y-4">
                {/* Pending */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-purple-600">{member.pendingTasks}</span>
                    <span className="text-xs text-purple-500 bg-purple-50 px-2 py-1 rounded">Pending</span>
                  </div>
                </div>

                {/* In Progress */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">In Progress</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-cyan-600">{member.inProgressTasks}</span>
                    <span className="text-xs text-cyan-500 bg-cyan-50 px-2 py-1 rounded">In Progress</span>
                  </div>
                </div>

                {/* Completed */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completed</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-green-600">{member.completedTasks}</span>
                    <span className="text-xs text-green-500 bg-green-50 px-2 py-1 rounded">Completed</span>
                  </div>
                </div>

                {/* Completion Rate */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Completion Rate</span>
                    <span className="text-sm font-semibold text-gray-900">{member.completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        member.completionRate >= 70 ? 'bg-green-500' : 
                        member.completionRate >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${member.completionRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {sortedMembers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👥</span>
              </div>
            </div>
            <p className="text-gray-500 text-lg">No team members found</p>
            <p className="text-gray-400">Try adjusting your search criteria</p>
          </div>
        )}

        {/* Results Count */}
        <div className="mt-8 text-center text-sm text-gray-500">
          Showing {sortedMembers.length} of {teamMembers.length} team members
        </div>
      </div>
    </div>
  );
};

export default TeamMembers;