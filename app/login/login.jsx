"use client"
import React from 'react'
import { useState } from "react";
import { useRouter } from "next/navigation";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

const handleLogin = async () => {
  setLoading(true);
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (res.ok) {
      if (data.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/employee");
      }
    } else {
      console.error("Login failed:", data);
      alert(data.error || "Login failed");
    }
  } catch (error) {
    console.error("An error occurred during login:", error);
    alert("An error occurred. Please check the console for details.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div>

         <div>
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border p-2 mb-3 rounded"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border p-2 mb-3 rounded"
      />
      <button
        onClick={handleLogin}
        disabled={loading}
        className="btn cursor-pointer"
        type="button"
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </div>

    </div>
  )
}

export default Login;
