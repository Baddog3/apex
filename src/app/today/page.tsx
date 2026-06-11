import { AppLayout } from "@/components/AppLayout";
import { BirthTimeBanner } from "@/components/BirthTimeBanner";
import { TabPage } from "@/components/TabPage";
import { getProfile } from "@/lib/auth/get-profile";
import { t } from "@/lib/i18n";

export default async function TodayPage() {
  const profile = await getProfile();
  const strings = t();
  const displayName = profile?.name ?? profile?.sun_sign;

  return (
    <AppLayout>
      <TabPage title={strings.nav.today} description={strings.today.empty}>
        {displayName && (
          <p className="text-sm text-muted">
            {strings.today.greeting}, {displayName}
          </p>
        )}
        {profile && !profile.birth_time && <BirthTimeBanner />}
      </TabPage>
    </AppLayout>
  );
}
