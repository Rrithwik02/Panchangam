import { FormMessage } from "@/components/auth/AuthUI";
import { AccountSection } from "@/components/account/AccountUI";
import { ProfileForm } from "@/components/account/ProfileForm";
import { requireAccount } from "@/lib/account/data";

export default async function ProfilePage() {
  const account = await requireAccount("/account/profile");

  return (
    <AccountSection title="Profile" description="How your name appears on your Panchangam account.">
      {account.loadError && (
        <div className="mb-4">
          <FormMessage tone="error">{account.loadError}</FormMessage>
        </div>
      )}
      <ProfileForm userId={account.userId} initialName={account.profile?.name ?? ""} email={account.email ?? ""} />
    </AccountSection>
  );
}
