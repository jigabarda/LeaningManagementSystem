"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    async function handleLogout() {
      const { error } = await supabase.auth.signOut();

      if (error) {
        toast.error("Error logging out. Please try again.");
        console.error("Logout error:", error);
      } else {
        toast.success("Logged out successfully!");
        router.push("/login");
      }
    }

    handleLogout();
  }, [router]);

  return (
    <div className="flex justify-center items-center h-[70vh]">
      <p className="text-gray-600 text-lg">Logging you out...</p>
    </div>
  );
}
