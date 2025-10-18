"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// Upload avatar to Supabase Storage
async function uploadAvatar(
  file: File,
  userId: string
): Promise<string | null> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    console.error("Upload failed:", uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
  return data?.publicUrl ?? null;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const router = useRouter();

  // ✅ Auto refresh when user logs in
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === "SIGNED_IN") {
          window.location.reload(); // reload page when logged in
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // ✅ Load profile on mount
  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setErrorMessage(null);

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          console.error("User not found:", userError);
          router.push("/login");
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          setErrorMessage(
            "Failed to load your profile. Please try again later."
          );
          return;
        }

        if (!profileData) {
          console.warn("No profile found for user ID:", user.id);
          setErrorMessage("Profile not found. Please contact support.");
          return;
        }

        setProfile(profileData);
      } catch (error) {
        console.error("Unexpected error fetching profile:", error);
        setErrorMessage("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  // ✅ Handle avatar upload
  const handleAvatarUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file || !profile) return;

      setUploading(true);

      const newAvatarUrl = await uploadAvatar(file, profile.id);
      if (!newAvatarUrl) {
        alert("Failed to retrieve avatar URL.");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: newAvatarUrl })
        .eq("id", profile.id);

      if (error) throw error;

      setProfile({ ...profile, avatar_url: newAvatarUrl });
      alert("Avatar uploaded successfully!");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  // ✅ Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!profile) return;
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  // ✅ Save profile changes
  const handleSave = async () => {
    if (!profile) return;
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: profile.name,
          email: profile.email,
          role: profile.role,
          bio: profile.bio,
        })
        .eq("id", profile.id);

      if (error) throw error;

      alert("Profile updated successfully!");
      setEditMode(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to save changes.");
    }
  };

  // ✅ Loading UI
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600">Loading your profile...</p>
      </div>
    );
  }

  // ✅ Error UI
  if (errorMessage) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <h2 className="text-xl font-semibold mb-2 text-red-600">Error</h2>
        <p className="text-gray-600 mb-4">{errorMessage}</p>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Go Home
        </button>
      </div>
    );
  }

  // ✅ Not logged in UI
  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <p className="text-gray-600">
          You must be logged in to view your profile.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Go to Login
        </button>
      </div>
    );
  }

  // ✅ Main Profile UI
  return (
    <div className="max-w-lg mx-auto p-8 bg-white shadow-lg rounded-2xl mt-10">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">My Profile</h1>

      <div className="flex flex-col items-center">
        {profile.avatar_url ? (
          <Image
            src={profile.avatar_url}
            alt="User avatar"
            width={120}
            height={120}
            className="rounded-full object-cover mb-3"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 mb-3">
            No Image
          </div>
        )}

        {editMode && (
          <>
            <label
              htmlFor="avatar"
              className="cursor-pointer bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-sm"
            >
              {uploading ? "Uploading..." : "Change Avatar"}
            </label>
            <input
              id="avatar"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </>
        )}
      </div>

      <div className="space-y-4 mt-6 text-gray-700">
        {(["name", "email", "role"] as const).map((field) => (
          <div key={field}>
            <label
              htmlFor={field}
              className="block font-semibold capitalize text-gray-800"
            >
              {field}
            </label>
            {editMode ? (
              <input
                id={field}
                name={field}
                type="text"
                value={profile[field] ?? ""}
                onChange={handleChange}
                placeholder={`Enter your ${field}`}
                className="block w-full mt-1 p-2 border rounded-md"
              />
            ) : (
              <p>{profile[field] ?? "N/A"}</p>
            )}
          </div>
        ))}

        <div>
          <label htmlFor="bio" className="block font-semibold text-gray-800">
            Bio
          </label>
          {editMode ? (
            <textarea
              id="bio"
              name="bio"
              value={profile.bio ?? ""}
              onChange={handleChange}
              placeholder="Write something about yourself"
              className="block w-full mt-1 p-2 border rounded-md"
              rows={3}
            />
          ) : (
            <p>{profile.bio ?? "N/A"}</p>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        {editMode ? (
          <>
            <button
              onClick={handleSave}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Save Changes
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditMode(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
}
