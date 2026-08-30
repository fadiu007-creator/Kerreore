"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
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
  revalidatePath("/admin");
}

export async function reviewIdVerification(formData: FormData) {
  const userId = String(formData.get("user_id") ?? "");
  const approve = formData.get("approve") === "true";
  if (!userId) return;
  const db = await requireAdmin();
  await db.rpc("kerreore_review_id_verification", { p_user_id: userId, p_approve: approve });
  revalidatePath("/admin");
}

export async function resolveDisputeAction(formData: FormData) {
  const bookingId = String(formData.get("booking_id") ?? "");
  const resolution = String(formData.get("resolution") ?? "");
  if (!bookingId) return;
  const db = await requireAdmin();
  await db.rpc("kerreore_resolve_dispute", { p_booking_id: bookingId, p_resolution: resolution });
  revalidatePath("/admin");
}

export async function signOutAdmin() {
  const db = await createClient();
  await db.auth.signOut();
  redirect("/login");
}
