import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardRouter() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("kerreore_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "owner" || profile?.role === "admin") {
    redirect("/provider");
  }
  redirect("/bookings");
}
