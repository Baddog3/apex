import { AppLayout } from "@/components/AppLayout";
import { TabPage } from "@/components/TabPage";
import { getUser } from "@/lib/auth";
import { t } from "@/lib/i18n";

import { SignOutButton } from "./sign-out-button";

export default async function ProfilePage() {
  const user = await getUser();
  const strings = t();

  return (
    <AppLayout>
      <TabPage title={strings.nav.profile} description={strings.profile.empty}>
        {user?.email && <p className="text-sm text-muted">{user.email}</p>}
        <div className="mt-6">
          <SignOutButton />
        </div>
      </TabPage>
    </AppLayout>
  );
}
