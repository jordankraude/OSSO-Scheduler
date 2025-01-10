"use client"; // This makes the component a client component
import React, { useState } from "react";
import { signIn } from "next-auth/react"; // Import signIn from next-auth
import { useRouter } from "next/navigation"; // Import useRouter from Next.js

const LoginForm: React.FC = () => {
  const router = useRouter(); // Initialize the router
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);
  const [newPassword, setNewPassword] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Use the signIn function from next-auth
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false, // Prevent automatic redirection
    });

    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess("Logging in!");
      // Redirect to the desired page after successful login
      router.push("/dashboard"); // Use router.push instead of window.location.href
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Send a request to the API to change the password
    const response = await fetch('/api/auth/reset-password', { // Update with your API endpoint
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, newPassword }),
    });

    if (response.ok) {
      setSuccess("Password changed successfully!");
      setNewPassword(""); // Clear the input
      setIsChangingPassword(false); // Hide the change password form
    } else {
      const errorData = await response.json();
      setError(errorData.error || "Failed to change password.");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-2 border mb-4"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-2 border mb-4"
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Login
        </button>
      </form>

      {/* Change Password Section */}
      <div className="mt-4">
        <button
          onClick={() => router.push("/recover-password")} // Navigate to the recovery page
          className="text-blue-600 hover:underline ml-4"
        >
          Forgot Password?
        </button>
      </div>
    </div>
  );
};

export default LoginForm;
