"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect("/login");
  const { data: admin } = await db.rpc("kerreore_is_admin");
  if (!admin) redirect("/dashboard");
  return db;
}

export async function moderateVehicle(formData: FormData) {
  const id = String(formData.get("vehicle_id") ?? "");
  const published = formData.get("published") === "true";
  if (!id) return;
  const db = await requireAdmin();
  await db.from("kerreore_vehicles").update({ published }).eq("id", id);
}

export async function signOutAdmin() {
  const db = await createClient();
  await db.auth.signOut();
  redirect("/login");
}
