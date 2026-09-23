"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { accountButton } from "@/components/account/AccountUI";

export function LogoutButton() {
  const { signOut } = useAuth();
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await signOut();
      }}
      className={accountButton.secondary}
    >
      {pending ? "Logging out…" : "Logout"}
    </button>
  );
}
