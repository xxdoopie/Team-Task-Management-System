"use client";

import { useState } from "react";
import Login from "./login/login";
import Signup from "./signUp/signUp";

export default function HomePage() {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Section (Form) */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-gray-50 px-6">
        <div className="w-full max-w-[700px] bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-2 text-gray-900">
            {showLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {showLogin
              ? "Please enter your details to log in"
              : "Please enter your details to sign up"}
          </p>

          {showLogin ? (
            <>
              <Login />
              <p className="mt-6 text-center text-sm">
                Don’t have an account?{" "}
                <button
                  onClick={() => setShowLogin(false)}
                  className="text-blue-600 font-medium hover:underline"
                >
                  Sign up
                </button>
              </p>
            </>
          ) : (
            <>
              <Signup onSignupSuccess={() => setShowLogin(true)} />
              <p className="mt-6 text-center text-sm">
                Already have an account?{" "}
                <button
                  onClick={() => setShowLogin(true)}
                  className="text-blue-600 font-medium hover:underline"
                >
                  Log in
                </button>
              </p>
            </>
          )}
        </div>
      </div>

      {/* Right Section (Image) */}
      <div className="hidden md:flex w-1/2 bg-blue-600">
        <img
          src="shutterstock_2224170519.jpg"
          alt="Task Manager Illustration"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
