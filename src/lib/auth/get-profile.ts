import { getUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/db/server";
import type { Profile } from "@/lib/db/types";

export async function getProfile(): Promise<Profile | null> {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}
