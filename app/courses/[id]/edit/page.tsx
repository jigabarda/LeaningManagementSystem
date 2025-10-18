"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import type { Course } from "@/types";

export default function EditCoursePage() {
  const router = useRouter();
  const { id } = useParams();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadCourse() {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("❌ Failed to load course:", error);
      } else if (data) {
        setCourse(data);
        setTitle(data.title);
        setDescription(data.description);
        setPreviewUrl(data.image_url || null);
      }
      setLoading(false);
    }
    loadCourse();
  }, [id]);

  async function handleImageUpload() {
    if (!imageFile || !id) return null;

    const fileExt = imageFile.name.split(".").pop();
    const fileName = `course-${id}-${Date.now()}.${fileExt}`;
    const filePath = `courses/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("course_images")
      .upload(filePath, imageFile, {
        upsert: true,
        cacheControl: "3600",
        contentType: imageFile.type,
      });

    if (uploadError) {
      console.error("❌ Upload error:", uploadError);
      alert("Image upload failed.");
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from("course_images")
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  }

  async function handleSave() {
    try {
      setSaving(true);

      // ✅ Get current authenticated user
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) {
        alert("You must be signed in to update a course.");
        return;
      }

      let newImageUrl = previewUrl;
      if (imageFile) {
        newImageUrl = await handleImageUpload();
      }

      const { error: updateError } = await supabase
        .from("courses")
        .update({
          title,
          description,
          image_url: newImageUrl,
          user_id: user.id, // ensure the user owns this row
        })
        .eq("id", id);

      if (updateError) {
        console.error("Update error:", updateError);
        alert("❌ Failed to update course.");
        return;
      }

      alert("✅ Course updated successfully!");
      router.push(`/courses/${id}`);
    } catch (err) {
      console.error("Error updating course:", err);
      alert("Unexpected error occurred while updating the course.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this course?")) return;

    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (error) {
      console.error("Delete error:", error);
      alert("❌ Failed to delete course.");
    } else {
      alert("✅ Course deleted successfully!");
      router.push("/courses");
    }
  }

  if (loading) return <p className="p-6 text-center">Loading course...</p>;
  if (!course) return <p className="p-6 text-center">Course not found.</p>;

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Edit Course</h1>

      {/* Title */}
      <div className="mb-4">
        <label htmlFor="title" className="block text-gray-700 font-medium mb-1">
          Course Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          title="Course Title"
          placeholder="Enter course title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>

      {/* Description */}
      <div className="mb-4">
        <label
          htmlFor="description"
          className="block text-gray-700 font-medium mb-1"
        >
          Course Description
        </label>
        <textarea
          id="description"
          name="description"
          title="Course Description"
          placeholder="Enter course description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border p-2 rounded min-h-[100px]"
        />
      </div>

      {/* Image Upload */}
      <div className="mb-6">
        <label htmlFor="image" className="block text-gray-700 font-medium mb-1">
          Course Image
        </label>

        {previewUrl && (
          <Image
            src={previewUrl}
            alt="Course Preview"
            width={300}
            height={180}
            className="rounded-lg mb-2 object-cover"
          />
        )}

        <input
          id="image"
          type="file"
          title="Course Image"
          accept="image/*"
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setImageFile(e.target.files?.[0] ?? null)
          }
          className="block w-full border p-2 rounded"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
