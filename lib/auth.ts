// lib/auth.ts
import { supabase } from "./supabaseClient";

export async function ensureProfile(user: any) {
  if (!user) return;
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (!data) {
    await supabase.from("profiles").insert([{ id: user.id, name: user.email }]);
  }
}
