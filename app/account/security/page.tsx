import { AccountSection } from "@/components/account/AccountUI";
import { LogoutButton } from "@/components/account/LogoutButton";
import { NewPasswordForm } from "@/components/auth/NewPasswordForm";
import { requireAccount } from "@/lib/account/data";

export default async function SecurityPage() {
  await requireAccount("/account/security");

  return (
    <div>
      <AccountSection title="Change Password">
        <div className="max-w-sm">
          <NewPasswordForm submitLabel="Update password" />
        </div>
      </AccountSection>
      <AccountSection title="Session" description="Log out of Panchangam on this device.">
        <LogoutButton />
      </AccountSection>
    </div>
  );
}
