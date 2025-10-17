"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role: "student" },
      },
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Signup successful! Please check your email for confirmation.");
      router.push("/login");
    }

    setLoading(false);
  }

  return (
    <div className="max-w-md mx-auto mt-12 border rounded-lg p-6 bg-white shadow">
      <h1 className="text-2xl font-semibold mb-4">Sign Up</h1>
      <form onSubmit={handleSignup} className="space-y-4">
        <input
          type="text"
          placeholder="Name"
          className="border rounded w-full p-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="border rounded w-full p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="border rounded w-full p-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {/* Role selection removed for security. All users are students by default. */}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
      <p className="text-sm text-gray-600 mt-4 text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-600 hover:underline">
          Login here
        </Link>
      </p>
    </div>
  );
}
