import { getProfile } from "@/lib/actions/profile";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/profile-form";
import { DeleteAccountForm } from "./delete-account-form";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const profile = await getProfile();

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Profile</h1>
        <p className="mt-1 text-sm text-slate-500">
          Update your info. This is used to pre-fill resumes and tailor content.
        </p>
      </header>
      <div className="max-w-[640px] rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <ProfileForm
          profile={profile}
          userEmail={user?.email}
          onSuccessRedirect="/profile"
          submitLabel="Save changes"
        />
        <DeleteAccountForm />
      </div>
    </div>
  );
}
