"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      // If the user is logged in, redirect them to the homepage or another page
      router.push("/"); // Redirect to home page or profile page
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setEmailError(null);
    setPasswordError(null);
    setGeneralError(null);
  
    try {
      const response = await fetch("http://127.0.0.1:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Optional: Depending on how your backend is set up
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        if (data.errors) {
          // Assign specific field errors if provided
          setEmailError(data.errors.email || null);
          setPasswordError(data.errors.password || null);
        } else if (data.message) {
          // Handle general error
          setGeneralError(data.message);
        }
        return;
      }
  
      console.log("Login successful");
  
      // Save token after successful login
      const token = data.token; // Assuming the token is in `data.token`
      if (token) {
        localStorage.setItem('authToken', token);
        // Dispatch a storage event to update the layout
        window.dispatchEvent(new Event('storage'));
      }
  
      router.push("/");
    } catch (err: any) {
      console.error("Error during login:", err);
      setGeneralError("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Login</h1>
        {generalError && <div className="text-red-500 mb-4">{generalError}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-gray-700 dark:text-gray-300 dark:bg-gray-700"
              required
            />
            {emailError && <div className="text-red-500 mt-1">{emailError}</div>}
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-gray-700 dark:text-gray-300 dark:bg-gray-700"
              required
            />
            {passwordError && <div className="text-red-500 mt-1">{passwordError}</div>}
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
            disabled={loading}
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link href="/signup">
            <span className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer">
              Don't have an account? Register here
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

