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

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ Sign up user in Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role: "student" }, // user metadata
        },
      });

      if (signUpError) {
        toast.error(signUpError.message);
        return;
      }

      if (data?.user) {
        // ✅ Supabase trigger automatically inserts profile
        toast.success(
          "Signup successful! Please check your email to confirm your account."
        );
        router.push("/login");
      } else {
        toast.error("No user returned. Please try again.");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Signup failed. Please try again.";
      console.error("Signup error:", message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 border rounded-lg p-6 bg-white shadow">
      <h1 className="text-2xl font-semibold mb-4 text-center text-gray-800">
        Sign Up
      </h1>

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Full Name"
            className="border rounded w-full p-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <input
            type="email"
            placeholder="Email"
            className="border rounded w-full p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <input
            type="password"
            placeholder="Password"
            className="border rounded w-full p-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 transition"
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
