"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui";
import { createClient } from "@/lib/db/client";
import { t } from "@/lib/i18n";

export function SignOutButton() {
  const strings = t();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <Button variant="secondary" fullWidth onClick={handleSignOut}>
      {strings.profile.signOut}
    </Button>
  );
}
