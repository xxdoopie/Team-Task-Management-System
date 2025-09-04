"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import EmployeeDashboard from "@/app/(components)/EmployeeComponents/EmployeeDashboard.jsx";
import EmployeeMyTasks from "@/app/(components)/EmployeeComponents/EmployeeManageTasks.jsx";
import EmployeeSideBar from "@/app/(components)/EmployeeComponents/EmployeeSideBar.jsx";

const Employee = () => {
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
        return <EmployeeDashboard user={user} />;
      case "manageTasks":
        return <EmployeeMyTasks />;
      case "seeAllTasks":
        return <EmployeeMyTasks />;
      case "logout":
        router.push("/");
        return null;
      default:
        return <EmployeeDashboard user={user} />;
    }
  };

  const isDashboard = currentSection === "dashboard";

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <EmployeeSideBar
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
            <EmployeeDashboard user={user} sendSection={(section) =>{
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

export default Employee;