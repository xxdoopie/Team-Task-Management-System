"use client";

import { useState } from "react";

export default function Signup({ onSignupSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, color: "red", label: "Very Weak" });

  // Email Validation
  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  // Password Strength Checker
  const checkPasswordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.match(/[A-Z]/)) score++;
    if (pwd.match(/[0-9]/)) score++;
    if (pwd.match(/[^a-zA-Z0-9]/)) score++;

    let color = "red";
    let label = "Very Weak";

    if (score === 1) {
      color = "red";
      label = "Weak";
    } else if (score === 2) {
      color = "orange";
      label = "Medium";
    } else if (score === 3) {
      color = "#c6b21d";
      label = "Strong";
    } else if (score >= 4) {
      color = "green";
      label = "Very Strong";
    }

    return { score, color, label };
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordStrength(checkPasswordStrength(value));
  };

  const handleSignup = async () => {
  console.log('test');
  
  const newErrors = {};
  if (!validateEmail(email)) {
    newErrors.email = "Please enter a valid email address.";
  }
  if (password.length < 6) {
    newErrors.password = "Password must be at least 6 characters.";
  }
  if (!name.trim()) {
    newErrors.name = "Please enter your name.";
  }

  setErrors(newErrors);
  if (Object.keys(newErrors).length > 0) return;

  setLoading(true);
  
  try {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        email, 
        password, 
        name,
        adminCode 
      }),
    });

    const data = await res.json();

    if (res.ok) {
      alert(`${data.user.role === 'admin' ? 'Admin' : 'User'} account created successfully!`);
      onSignupSuccess();
    } else {
      alert(data.error || "Signup failed");
    }
  } catch (error) {
    alert("Signup failed. Please try again.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="">
      <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>

      {/* Email Field */}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border p-2 mb-2 rounded"
      />
      {errors.email && <p className="text-red-500 mb-2">{errors.email}</p>}

    {/* Name Field */}
      <input
        type="text"
        placeholder="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border p-2 mb-2 rounded"
      />
      {/* Password Field */}
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={handlePasswordChange}
        className="w-full border p-2 mb-2 rounded"
      />
      {errors.password && <p className="text-red-500 mb-2">{errors.password}</p>}

      {/* Password Strength Bar */}
      {password && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="h-3 rounded-full"
              style={{
                width: `${(passwordStrength.score / 4) * 100}%`,
                backgroundColor: passwordStrength.color,
                transition: "width 0.3s ease"
              }}
            ></div>
          </div>
          <p className="text-sm mt-1" style={{ color: passwordStrength.color }}>
            {passwordStrength.label}
          </p>
        </div>
      )}

      {/* Admin Code Field */}
      <input
        type="password"
        placeholder="Admin code: optional"
        className="w-full border p-2 mb-3 rounded"
        value={adminCode}
        onChange={(e) => setAdminCode(e.target.value)}
      />

      <button
        onClick={handleSignup}
        disabled={loading}
        className="btn cursor-pointer"
      >
        {loading ? "Signing up..." : "Sign Up"}
      </button>
    </div>
  );
}
