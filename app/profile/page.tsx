"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { withAuth } from "@/lib/withAuth";

interface Profile {
  id: string;
  name: string;
  role: string;
}

function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [role, setRole] = useState("student");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("You must be logged in to view this page.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setProfile(data);
        setName(data.name || "");
        setRole(data.role || "student");
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  async function handleSave() {
    if (!profile) return;
    const { error } = await supabase
      .from("profiles")
      .update({ name, role })
      .eq("id", profile.id);

    setMessage(
      error
        ? "Error updating profile: " + error.message
        : "Profile updated successfully!"
    );
  }

  if (loading) return <p className="p-6">Loading profile...</p>;
  if (!profile)
    return (
      <p className="p-6 text-red-600">
        You must be logged in to view your profile.
      </p>
    );

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>

      {message && (
        <p
          className={`mb-4 ${
            message.includes("Error") ? "text-red-600" : "text-green-600"
          }`}
        >
          {message}
        </p>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded px-3 py-2 w-full"
            placeholder="Enter your name"
          />
        </div>

        <div>
          <label htmlFor="role-select" className="block text-sm font-medium">
            Role
          </label>
          <select
            id="role-select"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

export default withAuth(ProfilePage);
