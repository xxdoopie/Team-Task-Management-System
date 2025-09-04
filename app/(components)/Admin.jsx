"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminDashboard from "@/app/(components)/AdminComponents/AdminDashboard.jsx";
import ManageTasks from "@/app/(components)/AdminComponents/ManageTasks.jsx";
import CreateTask from "@/app/(components)/AdminComponents/CreateTask.jsx";
import SideBar from "@/app/(components)/AdminComponents/SideBar.jsx";
import TeamMembers from "@/app/(components)/AdminComponents/TeamMembers.jsx";

const Admin = () => {
  //views all the tasks that admin has created
  //managing all tasks
  //each created task has a deadline, title of the task, description of the task, priority, team members assigned, mini todo tasks, progress tracking, links, attachments

  const router = useRouter();
  const [currentSection, setCurrentSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/users/me', { method: 'GET' });
        if (!res.ok) {
          throw new Error('Unauthorized');
        }
        const data = await res.json();
        setUser(data.user);
      } catch (e) {
        router.push('/');
      }
    };
    fetchUser();
  }, [router]);

  const getSection = (section) => {
    switch (section) {
      case "dashboard":
        return <AdminDashboard user={user} sendSection={(section) =>{
          setCurrentSection(section);
        }} />;
      case "manageTasks":
        return <ManageTasks />;
      case "createTask":
        return <CreateTask />;
      case "teamMembers":
        return <TeamMembers />;
      case "seeAllTasks":
        return <ManageTasks />;
      case "logout":
        router.push("/");
        return null;
      default:
        return <AdminDashboard user={user} sendSection={(section) =>{
          setCurrentSection(section);
        }} />;
    }
  };

  const isDashboard = currentSection === "dashboard";

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <SideBar
        user={user}
        sendSection={(section) => {
          setCurrentSection(section);
          setSidebarOpen(false); // close on mobile after click
        }}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        } md:ml-64 ${isDashboard ? "" : "p-6"}`}
      >
        {/* Hamburger for mobile - only show when not dashboard */}
        {!isDashboard && (
          <button
            className="md:hidden p-3 text-gray-700 bg-gray-200 rounded-lg mb-4"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
        )}

        {/* Dashboard gets full layout control, others get wrapped */}
        {isDashboard ? (
          <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            {/* Hamburger for dashboard mobile */}
            <button
              className="md:hidden p-3 text-gray-700 bg-white rounded-lg mb-4 shadow-sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
            <AdminDashboard user={user} sendSection={(section) =>{
          setCurrentSection(section);
        }} />
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-lg min-h-[80vh]">
            {getSection(currentSection)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;