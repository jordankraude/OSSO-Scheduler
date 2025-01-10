'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation"; 

const RecoverPassword: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [stage, setStage] = useState<"request" | "verify" | "reset">("request");
  const [token, setToken] = useState<string | null>(null); // State to store the token

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (stage === "request") {
      // Request verification code
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/send-verification-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMessage("Please check your email for instructions to reset your password.");
        setStage("verify");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to initiate password recovery.");
      }
    } else if (stage === "verify") {
      // Verify the code and get the token
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.token); // Store the token
        setStage("reset");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Invalid verification code.");
      }
    } else if (stage === "reset") {
      // Check if passwords match
      if (newPassword !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      // Reset the password using the token
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/reset-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }), // Include token and new password
      });

      if (response.ok) {
        setMessage("Your password has been reset successfully!");
        setStage("request");
        setEmail("");
        setNewPassword("");
        setConfirmPassword("");
        setCode("");
        setToken(null); // Clear the token

        // Redirect to login page
        router.push('/login');
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to reset password.");
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow-md w-96 mx-auto my-auto text-black">
      <h2 className="text-2xl font-bold mb-4">Recover Password</h2>
      {error && <p className="text-red-500">{error}</p>}
      {message && <p className="text-green-500">{message}</p>}
      <form onSubmit={handleSubmit}>
        {stage === "request" && (
          <>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full p-2 border mb-4"
              required
            />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
              Send Recovery Email
            </button>
          </>
        )}
        {stage === "verify" && (
          <>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter verification code"
              className="w-full p-2 border mb-4"
              required
            />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
              Verify Code
            </button>
          </>
        )}
        {stage === "reset" && (
          <>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="w-full p-2 border mb-4"
              required
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              className="w-full p-2 border mb-4"
              required
            />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
              Reset Password
            </button>
          </>
        )}
      </form>
    </div>
  );
};

export default RecoverPassword;
