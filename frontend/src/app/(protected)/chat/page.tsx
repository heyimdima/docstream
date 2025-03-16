import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

import { Button } from "@/components/ui/button";

import { logout } from "@/app/(auth)/actions";

export default async function PrivatePage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/sign-in");
  }

  return (
    <div>
      <h1>This is a private page, new chat prompt is going to start here</h1>
    </div>
  );
}
